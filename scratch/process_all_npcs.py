import os
import cv2
import numpy as np
from PIL import Image

src_dir = r'H:\GOOGLE DRIVER\GAME\assets\NPC'
dst_base = r'H:\GOOGLE DRIVER\GAME\assets\npcs'
dst_npc_sub = r'H:\GOOGLE DRIVER\GAME\assets\NPC'
os.makedirs(dst_base, exist_ok=True)

files = sorted([f for f in os.listdir(src_dir) if f.startswith('ChatGPT') or f.startswith('Gemini_')])
print(f'Processing {len(files)} NPC sprite sheets...')

def process_black_bg_cell(cell):
    h, w = cell.shape[:2]
    gray = cv2.cvtColor(cell[:, :, :3], cv2.COLOR_BGR2GRAY)
    mask = np.where(gray > 18, 255, 0).astype(np.uint8)
    
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)
    
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)
    clean_mask = np.zeros_like(mask)
    if num_labels > 1:
        for lbl in range(1, num_labels):
            if stats[lbl, cv2.CC_STAT_AREA] > 60:
                clean_mask[labels == lbl] = 255
    else:
        clean_mask = mask
        
    smooth_alpha = cv2.GaussianBlur(clean_mask, (3, 3), 0)
    res = cv2.cvtColor(cell[:, :, :3], cv2.COLOR_BGR2BGRA)
    res[:, :, 3] = smooth_alpha
    return res, smooth_alpha

def process_gemini_cell(cell):
    h, w = cell.shape[:2]
    b, g, r_ch = cv2.split(cell[:, :, :3].astype(np.float32))
    max_c = np.maximum(np.maximum(r_ch, g), b)
    min_c = np.minimum(np.minimum(r_ch, g), b)
    chroma = max_c - min_c
    gray_val = (r_ch + g + b) / 3.0
    
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[:12, :] = cv2.GC_BGD
    mask[-12:, :] = cv2.GC_BGD
    mask[:, :12] = cv2.GC_BGD
    mask[:, -12:] = cv2.GC_BGD
    mask[12:-12, 12:-12] = cv2.GC_PR_FGD
    
    bg_candidate = (chroma < 10) & (gray_val > 112) & (gray_val < 188)
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    cell_copy = cell[:, :, :3].copy()
    
    seeds = [(6,6), (6, w-7), (h-7, 6), (h-7, w-7), (6, w//2), (h-7, w//2), (h//2, 6), (h//2, w-7)]
    for y_s, x_s in seeds:
        if bg_candidate[y_s, x_s]:
            cv2.floodFill(cell_copy, flood_mask, (x_s, y_s), 0, (18,18,18), (18,18,18), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)
            
    flooded_bg = flood_mask[1:-1, 1:-1] == 255
    mask[flooded_bg] = cv2.GC_BGD
    
    fg_candidate = (chroma > 12) | (gray_val < 90) | (gray_val > 215)
    mask[fg_candidate & (mask != cv2.GC_BGD)] = cv2.GC_PR_FGD
    
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    try:
        cv2.grabCut(cell[:, :, :3], mask, None, bgdModel, fgdModel, 4, cv2.GC_INIT_WITH_MASK)
        grab_fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    except Exception as e:
        grab_fg = np.where(~flooded_bg, 255, 0).astype(np.uint8)
        
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7))
    grab_fg = cv2.morphologyEx(grab_fg, cv2.MORPH_CLOSE, kernel_close)
    
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(grab_fg)
    clean_mask = np.zeros_like(grab_fg)
    for lbl in range(1, num_labels):
        area = stats[lbl, cv2.CC_STAT_AREA]
        cx, cy = centroids[lbl]
        if area > 100 and (0.10*w < cx < 0.90*w) and (0.05*h < cy < 0.96*h):
            clean_mask[labels == lbl] = 255
            
    # Shadow suppression at bottom
    for y in range(int(h * 0.85), h):
        row_fg = clean_mask[y, :] == 255
        if np.any(row_fg):
            is_shadow = (chroma[y, :] < 8) & (gray_val[y, :] > 85) & (gray_val[y, :] < 150)
            clean_mask[y, row_fg & is_shadow] = 0
            
    smooth_alpha = cv2.GaussianBlur(clean_mask, (3,3), 0)
    res = cv2.cvtColor(cell[:, :, :3], cv2.COLOR_BGR2BGRA)
    res[:, :, 3] = smooth_alpha
    return res, smooth_alpha

for sheet_idx, fname in enumerate(files):
    npc_name = f'npc_{sheet_idx+1:02d}'
    target_dirs = [
        os.path.join(dst_base, npc_name),
        os.path.join(dst_npc_sub, npc_name)
    ]
    
    for tdir in target_dirs:
        os.makedirs(os.path.join(tdir, 'right', 'idle'), exist_ok=True)
        os.makedirs(os.path.join(tdir, 'right', 'run'), exist_ok=True)
        os.makedirs(os.path.join(tdir, 'right', 'attack'), exist_ok=True)
        
    p = os.path.join(src_dir, fname)
    is_black = (sheet_idx == 0)
    img = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    h, w = img.shape[:2]
    cell_h, cell_w = h // 4, w // 4
    
    raw_frames = []
    max_frame_h = 0
    
    for r in range(4):
        for c in range(4):
            x0, y0 = c * cell_w, r * cell_h
            cell = img[y0:y0+cell_h, x0:x0+cell_w]
            if is_black:
                res, alpha = process_black_bg_cell(cell)
            else:
                res, alpha = process_gemini_cell(cell)
            
            nz = np.where(alpha > 30)
            if len(nz[0]) > 0:
                ymin, ymax = np.min(nz[0]), np.max(nz[0])
                xmin, xmax = np.min(nz[1]), np.max(nz[1])
                crop_h = ymax - ymin + 1
                crop_w = xmax - xmin + 1
                if r < 2:
                    max_frame_h = max(max_frame_h, crop_h)
            else:
                ymin, ymax, xmin, xmax = 0, cell_h-1, 0, cell_w-1
                crop_h, crop_w = cell_h, cell_w
                
            raw_frames.append({
                'res': res, 'alpha': alpha,
                'ymin': ymin, 'ymax': ymax, 'xmin': xmin, 'xmax': xmax,
                'crop_h': crop_h, 'crop_w': crop_w,
                'row': r, 'col': c
            })
            
    standing_h = max_frame_h if max_frame_h > 50 else int(cell_h * 0.75)
    global_scale = 300.0 / standing_h
    
    final_canvases = []
    for f_info in raw_frames:
        cropped = f_info['res'][f_info['ymin']:f_info['ymax']+1, f_info['xmin']:f_info['xmax']+1]
        ch_h, ch_w = cropped.shape[:2]
        
        new_w = max(1, int(round(ch_w * global_scale)))
        new_h = max(1, int(round(ch_h * global_scale)))
        
        if new_h > 340:
            adj_scale = 340.0 / ch_h
            new_w = max(1, int(round(ch_w * adj_scale)))
            new_h = 340
            resized = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        else:
            resized = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
            
        canvas = np.zeros((384, 384, 4), dtype=np.uint8)
        dst_y2 = 350 # Baseline anchor at 350/384px (matching player baseline)
        dst_y1 = dst_y2 - new_h
        dst_x1 = max(0, (384 - new_w) // 2)
        dst_x2 = min(384, dst_x1 + new_w)
        
        res_slice = resized[:(dst_y2 - dst_y1), :(dst_x2 - dst_x1)]
        canvas[dst_y1:dst_y1+res_slice.shape[0], dst_x1:dst_x1+res_slice.shape[1]] = res_slice
        final_canvases.append(canvas)
        
    for tdir in target_dirs:
        dir_idle = os.path.join(tdir, 'right', 'idle')
        dir_run = os.path.join(tdir, 'right', 'run')
        dir_attack = os.path.join(tdir, 'right', 'attack')
        
        # Row 0: idle (4 frames)
        for c in range(4):
            cv2.imwrite(os.path.join(dir_idle, f'{c:02d}.png'), final_canvases[c])
            cv2.imwrite(os.path.join(tdir, f'{c:02d}.png'), final_canvases[c])
            
        # Row 1: run (4 frames)
        for c in range(4):
            cv2.imwrite(os.path.join(dir_run, f'{c:02d}.png'), final_canvases[4+c])
            cv2.imwrite(os.path.join(tdir, f'{4+c:02d}.png'), final_canvases[4+c])
            
        # Row 2 & 3: attack (8 frames)
        for i in range(8):
            cv2.imwrite(os.path.join(dir_attack, f'{i:02d}.png'), final_canvases[8+i])
            cv2.imwrite(os.path.join(tdir, f'{8+i:02d}.png'), final_canvases[8+i])
            
    print(f'[OK] [NPC {sheet_idx+1}/9] {fname} -> Created 16 frames in {target_dirs[0]} & {target_dirs[1]}')

print('All 9 NPC spritesets completed successfully!')
