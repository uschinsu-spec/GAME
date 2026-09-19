with open('src/game-runtime.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('#bossBar.hidden=false;', "if($('#bossBar')) $('#bossBar').hidden=false;")
text = text.replace('#bossName.textContent=boss.name;', "if($('#bossName')) $('#bossName').textContent=boss.name;")

with open('src/game-runtime.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated successfully')
