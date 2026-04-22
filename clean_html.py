import os

def clean_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Line 2872 is index 2871 (1st script line: <script>)
    # Line 8154 is index 8153 (last script line: </script>)
    
    start_idx = 2871
    end_idx = 8153
    
    if lines[start_idx].strip() == '<script>' and lines[end_idx].strip() == '</script>':
        print(f"Found script block at {start_idx} to {end_idx}")
        new_lines = lines[:start_idx] + ['    <script src="game.js"></script>\n'] + lines[end_idx+1:]
        with open('index.html', 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Successfully updated index.html")
    else:
        print(f"Error: Script block markers not found. Line {start_idx+1}: {lines[start_idx].strip()}, Line {end_idx+1}: {lines[end_idx].strip()}")

if __name__ == '__main__':
    clean_html()
