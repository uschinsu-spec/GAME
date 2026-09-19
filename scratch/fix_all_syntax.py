with open('src/game-runtime.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix player float text
text = text.replace("floatText(player.mesh.position,- ,DAMAGE_COLORS[type]||'#ff776d');", "floatText(player.mesh.position, '-'+Math.round(reduced)+' '+(DAMAGE_LABELS[type]||type), DAMAGE_COLORS[type]||'#ff776d');")

with open('src/game-runtime.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Syntax fixed')
