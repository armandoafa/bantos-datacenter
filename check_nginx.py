import pexpect
import sys

def check():
    child = pexpect.spawn('ssh root@72.62.128.126', encoding='utf-8')
    child.logfile = sys.stdout
    child.expect(['root@', '#', '\\$'], timeout=15)
    child.sendline('4p1B4nt0sC10ud26#')
    child.expect(['root@', '#', '\\$'], timeout=15)

    commands = [
        "cat /etc/nginx/sites-enabled/bantos.cloud",
        "cat /etc/nginx/sites-available/lms.bantos.cloud",
        "exit"
    ]
    for cmd in commands:
        child.sendline(cmd)
        child.expect(['root@', '#', '\\$', pexpect.EOF], timeout=15)

if __name__ == '__main__':
    check()
