import pexpect
import sys

def check():
    child = pexpect.spawn('ssh root@72.62.128.126', encoding='utf-8')
    child.logfile = sys.stdout
    idx = child.expect(['assword:', 'root@', '#', '\\$'], timeout=15)
    if idx == 0:
        child.sendline('4p1B4nt0sC10ud26#')
        child.expect(['root@', '#', '\\$'], timeout=15)

    child.sendline('grep -E "location|proxy_pass|root" /etc/nginx/sites-enabled/bantos.cloud /etc/nginx/sites-enabled/lms.bantos.cloud')
    child.expect(['root@', '#', '\\$'], timeout=15)

if __name__ == '__main__':
    check()
