import subprocess
try:
    ssh_cmd = "ssh -o StrictHostKeyChecking=no root@72.62.128.126 'tail -n 100 /root/.pm2/logs/bantos-api-error.log'"
    result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
except Exception as e:
    print(e)
