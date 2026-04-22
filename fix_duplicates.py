def fix_game_js():
    with open('game.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Range of Map Editor section is approximately 5068 to end
    start_line = 5068 # index
    
    for i in range(start_line, len(lines)):
        lines[i] = lines[i].replace('const raycaster =', 'const mapEditorRaycaster =')
        lines[i] = lines[i].replace('const mouse =', 'const mapEditorMouse =')
        # Use simple word replacement to avoid unintended matches, but since it's just 'raycaster' and 'mouse'
        # we should be careful.
        # However, in this section (Map Editor), they are used for picking objects.
        lines[i] = lines[i].replace('raycaster.setFromCamera(mouse,', 'mapEditorRaycaster.setFromCamera(mapEditorMouse,')
        lines[i] = lines[i].replace('getMousePos(e)', 'getMapEditorMousePos(e)') # Rename helper too
        lines[i] = lines[i].replace('function getMousePos(e)', 'function getMapEditorMousePos(e)')
        lines[i] = lines[i].replace('raycaster.intersectObjects', 'mapEditorRaycaster.intersectObjects')

    with open('game.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully fixed game.js duplicates")

if __name__ == '__main__':
    fix_game_js()
