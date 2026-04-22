import subprocess
import os

git_exe = r"C:\Users\User\AppData\Local\GitHubDesktop\app-3.4.15\resources\app\git\bin\git.exe"
repo_url = "https://github.com/onurerdzhanov23-gif/StarSkrills"
cwd = r"c:\Users\User\Desktop\BrawlClone3D"

def run_git(args):
    cmd = [git_exe] + args
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    else:
        print(f"Success: {result.stdout}")
    return result

# 1. Check current remotes
remotes = run_git(["remote", "-v"])
if "origin" in remotes.stdout:
    run_git(["remote", "set-url", "origin", repo_url])
else:
    run_git(["remote", "add", "origin", repo_url])

# 2. Add files
run_git(["add", "."])

# 3. Commit
run_git(["commit", "-m", "Fix: Unified multiplayer server and client logic"])

# 4. Push
# We try main first, then master
push_result = run_git(["push", "-u", "origin", "main"])
if push_result.returncode != 0:
    run_git(["push", "-u", "origin", "master"])
