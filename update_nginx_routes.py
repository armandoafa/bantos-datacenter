import pexpect
import sys

def update_nginx():
    child = pexpect.spawn('ssh root@72.62.128.126', encoding='utf-8')
    child.logfile = sys.stdout
    idx = child.expect(['assword:', 'root@', '#', '\\$'], timeout=15)
    if idx == 0:
        child.sendline('4p1B4nt0sC10ud26#')
        child.expect(['root@', '#', '\\$'], timeout=15)

    commands = [
        # Backup configs
        "cp /etc/nginx/sites-available/bantos.cloud /etc/nginx/sites-available/bantos.cloud.bak",
        "cp /etc/nginx/sites-available/lms.bantos.cloud /etc/nginx/sites-available/lms.bantos.cloud.bak",
        
        # Add /api/ location if not present in bantos.cloud
        "grep -q 'location /api/' /etc/nginx/sites-available/bantos.cloud || sed -i '/location \\/datacenter-api\\//i \\    location /api/ {\\n        proxy_pass http://127.0.0.1:4000/api/;\\n        proxy_http_version 1.1;\\n        proxy_set_header Upgrade $http_upgrade;\\n        proxy_set_header Connection '\''upgrade'\'';\\n        proxy_set_header Host $host;\\n        proxy_cache_bypass $http_upgrade;\\n        proxy_read_timeout 300s;\\n    }\\n' /etc/nginx/sites-available/bantos.cloud",
        
        # Add /api/ location if not present in lms.bantos.cloud
        "grep -q 'location /api/' /etc/nginx/sites-available/lms.bantos.cloud || sed -i '/location \\/datacenter-api\\//i \\    location /api/ {\\n        proxy_pass http://127.0.0.1:4000/api/;\\n        proxy_http_version 1.1;\\n        proxy_set_header Upgrade $http_upgrade;\\n        proxy_set_header Connection '\''upgrade'\'';\\n        proxy_set_header Host $host;\\n        proxy_set_header X-Real-IP $remote_addr;\\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\\n        proxy_set_header X-Forwarded-Proto $scheme;\\n        proxy_cache_bypass $http_upgrade;\\n        proxy_read_timeout 300s;\\n    }\\n' /etc/nginx/sites-available/lms.bantos.cloud",
        
        # Test and reload Nginx
        "nginx -t",
        "systemctl reload nginx",
        "exit"
    ]

    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        child.sendline(cmd)
        child.expect(['root@', '#', '\\$', pexpect.EOF], timeout=15)

if __name__ == '__main__':
    update_nginx()
