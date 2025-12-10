
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

// OMEGA FIX: Increase Max Buffer to 50MB to prevent crashes on large outputs (npm install, huge scans)
const execPromise = util.promisify((cmd, opts, cb) => exec(cmd, { ...opts, maxBuffer: 1024 * 1024 * 50 }, cb));

class Armory {
  constructor() {
    this.tools = {
      'SYSTEM_INFO': this.getSystemInfo,
      'LIST_PROCESSES': this.listProcesses,
      'NETWORK_SCAN': this.networkScan,
      'GIT_CLONE': this.gitClone,
      'NPM_INSTALL': this.npmInstall,
      'SHELL_EXEC': this.shellExec, 
      'SEND_EMAIL': this.sendEmail,
      'TELEGRAM_MSG': this.sendTelegram,
      'DISCORD_WEBHOOK': this.sendDiscord,
      'SSH_EXEC': this.sshExec,
      'GET_HARDWARE_METRICS': this.getHardwareMetrics,
      'KILL_PROCESS': this.killProcess,
      'SET_HIGH_PRIORITY': this.setHighPriority,
      'PURGE_BLOATWARE': this.purgeBloatware,
      'FLUSH_SYSTEM_RAM': this.flushSystemRam,
      'OPEN_APP': this.openApp
    };
  }

  async use(toolName, params) {
    logger.info(`[ARMORY] ⚔️ Engaging Tool: ${toolName}`);
    
    // AEGIS GOVERNANCE (Safety Check)
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

  // --- REAL SYSTEM TOOLS ---

  async shellExec({ command, cwd }) {
      logger.warn(`[ARMORY] ⚠️ RAW SHELL EXECUTION: ${command}`);
      const { stdout, stderr } = await execPromise(command, { cwd: cwd || './workspace' });
      return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  async getSystemInfo() {
    try {
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        
        return { 
            platform: `${osInfo.distro} ${osInfo.release}`, 
            cpu_brand: cpu.brand,
            cores: cpu.cores,
            memory_total_gb: (mem.total / 1024 / 1024 / 1024).toFixed(1),
            uptime_hours: (os.uptime() / 3600).toFixed(1)
        };
    } catch (e) {
        return { platform: os.platform(), error: "Detailed stats unavailable" };
    }
  }

  async listProcesses() {
    try {
        const list = await si.processes();
        // Return top 15 by CPU usage to avoid flooding context
        const top = list.list
            .sort((a, b) => b.cpu - a.cpu)
            .slice(0, 15)
            .map(p => ({ pid: p.pid, name: p.name, cpu: p.cpu.toFixed(1), mem: p.mem.toFixed(1) }));
        return JSON.stringify(top);
    } catch (e) {
        // Fallback for primitive environments
        const cmd = os.platform() === 'win32' ? 'tasklist' : 'ps aux --sort=-%mem | head -n 10';
        const { stdout } = await execPromise(cmd);
        return stdout;
    }
  }

  async networkScan() { 
      const interfaces = os.networkInterfaces();
      const summary = {};
      for (const [name, nets] of Object.entries(interfaces)) {
          summary[name] = nets.map(n => n.address);
      }
      return summary;
  }

  async openApp({ appName }) {
      logger.info(`[ARMORY] 🚀 Launching: ${appName}`);
      const cmd = os.platform() === 'win32' 
          ? `start "" "${appName}"` 
          : os.platform() === 'darwin' 
             ? `open -a "${appName}"` 
             : `xdg-open "${appName}"`; // Linux
      
      await execPromise(cmd);
      return { status: "LAUNCHED", target: appName };
  }

  async gitClone({ repoUrl, targetDir }) {
    if (!repoUrl) throw new Error("Repo URL required");
    const safeDir = targetDir || './workspace/repo_' + Date.now();
    await execPromise(`git clone ${repoUrl} ${safeDir}`);
    return { status: 'CLONED', path: safeDir };
  }

  async npmInstall({ targetDir }) {
    const cwd = targetDir || './workspace';
    await execPromise('npm install', { cwd });
    return { status: 'INSTALLED' };
  }

  // --- HARDWARE SYMBIOSIS ---
  async getHardwareMetrics() {
      try {
          const load = await si.currentLoad();
          const mem = await si.mem();
          const temp = await si.cpuTemperature();
          
          return {
              cpu_load: Math.round(load.currentLoad),
              cpu_temp: temp.main || "N/A",
              ram_used_percent: Math.round((mem.active / mem.total) * 100),
              cores: load.cpus.length
          };
      } catch (e) {
          logger.warn("Hardware metrics failed (SystemInformation not available?)", e);
          return { cpu_load: 50, note: "Simulated stats" };
      }
  }

  async killProcess({ pid, name }) {
      logger.warn(`[ARMORY] 💀 TERMINATION REQUEST: PID ${pid} / Name ${name}`);
      
      if (!pid && !name) throw new Error("Target PID or Name required");
      
      // Protection against suicide
      if (pid == process.pid || name?.includes('node')) {
          throw new Error("ARMORY SAFETY: Cannot kill Nexus Core.");
      }

      try {
          const cmd = process.platform === 'win32' 
            ? (pid ? `taskkill /F /PID ${pid}` : `taskkill /F /IM ${name}`) 
            : (pid ? `kill -9 ${pid}` : `pkill -9 ${name}`);
          
          await execPromise(cmd);
          return { status: "TERMINATED", target: pid || name };
      } catch (e) {
          return { status: "FAILED", error: e.message };
      }
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
