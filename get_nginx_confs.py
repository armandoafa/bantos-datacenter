import pexpect

def get_conf(filename):
    child = pexpect.spawn(f'ssh root@72.62.128.126 "cat {filename}"', encoding='utf-8')
    idx = child.expect(['assword:', pexpect.EOF], timeout=15)
    if idx == 0:
        child.sendline('4p1B4nt0sC10ud26#')
        child.expect(pexpect.EOF, timeout=15)
    print(f"=== {filename} ===")
    print(child.before)

if __name__ == '__main__':
    get_conf('/etc/nginx/sites-enabled/bantos.cloud')
    get_conf('/etc/nginx/sites-enabled/lms.bantos.cloud')
