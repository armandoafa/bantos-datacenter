import pexpect
import sys

def deploy():
    print("Starting deployment via SSH...")
    child = pexpect.spawn('ssh root@72.62.128.126', encoding='utf-8')
    child.logfile = sys.stdout
    
    # Wait for password prompt or shell prompt
    index = child.expect(['assword:', 'Are you sure you want to continue connecting', '#', '\\$', pexpect.EOF, pexpect.TIMEOUT], timeout=15)
    
    if index == 1: # yes/no
        child.sendline('yes')
        index2 = child.expect(['assword:', '#', '\\$', pexpect.EOF, pexpect.TIMEOUT], timeout=15)
        if index2 == 0:
            child.sendline('4p1B4nt0sC10ud26#')
            child.expect(['#', '\\$'], timeout=15)
    elif index == 0: # password
        child.sendline('4p1B4nt0sC10ud26#')
        child.expect(['#', '\\$'], timeout=15)
    elif index in [2, 3]: # already at shell prompt
        pass
    else:
        print("\nFailed to connect or timeout.")
        return

    print("\nConnected to VPS. Running deployment commands...")
    
    commands = [
        "cd /var/www/bantos.cloud/bantos-datacenter",
        "git pull origin main",
        "cd server",
        "npm install",
        "node migrate.js",
        "pm2 restart all",
        "cd ../client",
        "npm install",
        "npm run build",
        "cd ../insight-client",
        "npm install",
        "npm run build",
        "exit"
    ]
    
    for cmd in commands:
        print(f"\nRunning: {cmd}")
        child.sendline(cmd)
        child.expect(['#', '\\$'], timeout=120)
    
    child.sendline('exit')
    child.expect(pexpect.EOF)
    print("\nDeployment finished successfully.")

if __name__ == '__main__':
    deploy()
