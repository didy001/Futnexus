
import { exec } from 'child_process';
import util from 'util';
import os from 'os';
import fs from 'fs';
import logger from './logger.js';
import nodemailer from 'nodemailer';
import { Client } from 'ssh2';
import axios from 'axios';
import { aegis } from './Aegis.js';
import si from 'systeminformation';

const execPromise = util.promisify(exec);

class Armory {
  constructor() {
    this.tools = {
      'SYSTEM_INFO': this.getSystemInfo,
      'LIST_PROCESSES': this.listProcesses,
      'NETWORK_SCAN': this.networkScan,
      'GIT_CLONE': this.gitClone,
      'NPM_INSTALL': this.npmInstall,
      'SEND_EMAIL': this.sendEmail,
      'TELEGRAM_MSG': this.sendTelegram,
      'DISCORD_WEBHOOK': this.sendDiscord,
      'SSH_EXEC': this.sshExec,
      'GET_HARDWARE_METRICS': this.getHardwareMetrics,
      'KILL_PROCESS': this.killProcess,
      'SET_HIGH_PRIORITY': this.setHighPriority,
      'PURGE_BLOATWARE': this.purgeBloatware,
      'FLUSH_SYSTEM_RAM': this.flushSystemRam
    };
  }

  async use(toolName, params) {
    logger.info(`[ARMORY] ⚔️ Engaging Tool: ${toolName}`);
    
    // AEGIS GOVERNANCE
    try {
        await aegis.governOutput('ARMORY', toolName, params);
    } catch (securityError) {
        logger.error(`[ARMORY] 🛡️ AEGIS INTERVENTION: ${securityError.message}`);
        throw securityError;
    }

    if (this.tools[toolName]) {
      return this.tools[toolName].call(this, params);
    }
    throw new Error(`Tool ${toolName} not found in Armory.`);
  }

  // --- BASE TOOLS ---
  async getSystemInfo() {
    return { platform: os.platform(), cpus: os.cpus().length, memory_free: os.freemem(), uptime: os.uptime() };
  }

  async listProcesses() {
    const cmd = os.platform() === 'win32' ? 'tasklist' : 'ps aux --sort=-%mem | head -n 10';
    const { stdout } = await execPromise(cmd);
    return stdout;
  }

  async networkScan() { return os.networkInterfaces(); }

  async gitClone({ repoUrl, targetDir }) {
    if (!repoUrl) throw new Error("Repo URL required");
    const safeDir = targetDir || './workspace/repo_' + Date.now();
    await execPromise(`git clone ${repoUrl} ${safeDir}`);
    return { status: 'CLONED', path: safeDir };
  }

  async npmInstall({ targetDir }) {
    await execPromise('npm install', { cwd: targetDir });
    return { status: 'INSTALLED' };
  }

  // --- HARDWARE SYMBIOSIS ---
  async getHardwareMetrics() {
      try {
          const load = await si.currentLoad();
          const mem = await si.mem();
          const temp = await si.cpuTemperature();
          
          return {
              cpu_load: load.currentLoad,
              cpu_temp: temp.main,
              ram_used_percent: (mem.active / mem.total) * 100,
              cores: load.cpus.length
          };
      } catch (e) {
          logger.warn("Hardware metrics failed (SystemInformation not available?)", e);
          return { cpu_load: 50, note: "Simulated stats" };
      }
  }

  async killProcess({ pid, name }) {
      // DANGEROUS: AEGIS must check this.
      if (!pid && !name) throw new Error("Target PID or Name required");
      const cmd = process.platform === 'win32' 
        ? `taskkill /F /PID ${pid}` 
        : `kill -9 ${pid}`;
      
      await execPromise(cmd);
      return { status: "TERMINATED", target: pid || name };
  }

  // --- TYRANT PROTOCOL (OS DOMINATION) ---
  
  async setHighPriority() {
      const pid = process.pid;
      logger.info(`[ARMORY] 👑 Seizing CPU Priority for Nexus (PID: ${pid})...`);
      
      try {
          if (os.platform() === 'win32') {
              // Windows: Set to High Priority
              await execPromise(`wmic process where processid="${pid}" CALL setpriority "128"`);
          } else {
              // Linux/Mac: Renice to -10 (High Priority)
              await execPromise(`renice -n -10 -p ${pid}`);
          }
          return { status: "DOMINANCE_ESTABLISHED", level: "HIGH_PRIORITY" };
      } catch (e) {
          logger.warn(`[ARMORY] Failed to set priority (Admin rights needed?): ${e.message}`);
          return { status: "FAILED", reason: "PERMISSION_DENIED" };
      }
  }

  async purgeBloatware() {
      logger.info(`[ARMORY] 🧹 Purging non-essential processes to feed Nexus...`);
      const bloatList = os.platform() === 'win32' 
        ? ['Teams.exe', 'Spotify.exe', 'Cortana.exe', 'Skype.exe', 'OneDrive.exe']
        : ['spotify', 'discord', 'slack', 'teams'];

      let killed = [];
      for (const proc of bloatList) {
          try {
              const cmd = os.platform() === 'win32' 
                ? `taskkill /F /IM ${proc}` 
                : `pkill -9 ${proc}`;
              await execPromise(cmd);
              killed.push(proc);
          } catch (e) {
              // Process likely not running, ignore
          }
      }
      return { status: "PURGED", targets: killed };
  }

  async flushSystemRam() {
      logger.info(`[ARMORY] 🚿 Flushing System Memory...`);
      try {
          if (os.platform() === 'linux') {
              // Linux cache drop (Requires root usually)
              await execPromise('sync; echo 3 > /proc/sys/vm/drop_caches');
          } else if (os.platform() === 'darwin') {
              await execPromise('purge');
          } else {
              // Windows doesn't have a direct CLI flush without external tools, 
              // so we trigger a garbage collection on Node itself
              if (global.gc) global.gc();
          }
          return { status: "FLUSHED" };
      } catch (e) {
          return { status: "SKIPPED", reason: e.message };
      }
  }

  // --- DIGITAL TENTACLES ---
  async sendEmail({ to, subject, text }) {
    if (!process.env.EMAIL_USER) throw new Error("Missing EMAIL_USER in .env");
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const info = await transporter.sendMail({ from: `"Nexus Omega" <${process.env.EMAIL_USER}>`, to, subject, text });
    return { status: 'SENT', messageId: info.messageId };
  }

  async sendTelegram({ chatId, message }) {
      if (!process.env.TELEGRAM_TOKEN) throw new Error("Missing TELEGRAM_TOKEN");
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
      await axios.post(url, { chat_id: chatId, text: message });
      return { status: 'SENT' };
  }

  async sendDiscord({ webhookUrl, content }) {
      await axios.post(webhookUrl, { content, username: "Nexus Omega" });
      return { status: 'SENT' };
  }

  async sshExec({ host, username, privateKeyPath, command }) {
      return new Promise((resolve, reject) => {
          const conn = new Client();
          conn.on('ready', () => {
              conn.exec(command, (err, stream) => {
                  if (err) { conn.end(); return reject(err); }
                  let stdout = '';
                  stream.on('close', (code, signal) => {
                      conn.end();
                      resolve({ status: 'EXECUTED', code, stdout });
                  }).on('data', (data) => stdout += data).stderr.on('data', () => {});
              });
          }).connect({ host, port: 22, username, privateKey: fs.readFileSync(privateKeyPath) });
      });
  }
}

export const armory = new Armory();
