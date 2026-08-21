import subprocess
print("Fetching logs...")
try:
    ssh_cmd = "ssh -o StrictHostKeyChecking=no root@72.62.128.126 'pm2 logs bantos-api --lines 50 --nostream'"
    result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("ERR:", result.stderr)
except Exception as e:
    print(e)
