import os
import cv2
import numpy as np

src_dir = r'H:\GOOGLE DRIVER\GAME\assets\NPC\NPC 1'
dst_dirs = [
    r'H:\GOOGLE DRIVER\GAME\assets\NPC\NPC 1',
    r'H:\GOOGLE DRIVER\GAME\assets\npcs\npc_01',
    r'H:\GOOGLE DRIVER\GAME\assets\npc\npc_01'
]

# 16 files: split_0_0 to split_3_3
frames_order = [
    ('idle', 0, 'split_0_0.png'),
    ('idle', 1, 'split_0_1.png'),
    ('idle', 2, 'split_0_2.png'),
    ('idle', 3, 'split_0_3.png'),
    ('run', 0, 'split_1_0.png'),
    ('run', 1, 'split_1_1.png'),
    ('run', 2, 'split_1_2.png'),
    ('run', 3, 'split_1_3.png'),
    ('attack', 0, 'split_2_0.png'),
    ('attack', 1, 'split_2_1.png'),
    ('attack', 2, 'split_2_2.png'),
    ('attack', 3, 'split_2_3.png'),
    ('attack', 4, 'split_3_0.png'),
    ('attack', 5, 'split_3_1.png'),
    ('attack', 6, 'split_3_2.png'),
    ('attack', 7, 'split_3_3.png')
]

def clean_white_bg(img):
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    img_copy = img[:, :, :3].copy()
    for y_s, x_s in [(2,2), (2, w-3), (h-3, 2), (h-3, w-3), (2, w//2), (h-3, w//2), (h//2, 2), (h//2, w-3)]:
        if gray[y_s, x_s] > 230:
            cv2.floodFill(img_copy, flood_mask, (x_s, y_s), 0, (15,15,15), (15,15,15), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)

    flooded_bg = flood_mask[1:-1, 1:-1] == 255
    mask = np.where(~flooded_bg & (gray < 248), 255, 0).astype(np.uint8)
    
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
        
    smooth_alpha = cv2.GaussianBlur(clean_mask, (3,3), 0)
    res = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2BGRA)
    res[:, :, 3] = smooth_alpha
    return res, smooth_alpha

processed_info = []
max_standing_h = 0

for anim_state, frame_idx, fname in frames_order:
    fp = os.path.join(src_dir, fname)
    img = cv2.imread(fp, cv2.IMREAD_UNCHANGED)
    res, alpha = clean_white_bg(img)
    
    nz = np.where(alpha > 30)
    if len(nz[0]) > 0:
        ymin, ymax = np.min(nz[0]), np.max(nz[0])
        xmin, xmax = np.min(nz[1]), np.max(nz[1])
        crop_h = ymax - ymin + 1
        crop_w = xmax - xmin + 1
        if anim_state in ['idle', 'run']:
            max_standing_h = max(max_standing_h, crop_h)
    else:
        ymin, ymax, xmin, xmax = 0, img.shape[0]-1, 0, img.shape[1]-1
        crop_h, crop_w = img.shape[0], img.shape[1]
        
    processed_info.append({
        'state': anim_state, 'idx': frame_idx, 'fname': fname,
        'res': res, 'alpha': alpha,
        'ymin': ymin, 'ymax': ymax, 'xmin': xmin, 'xmax': xmax,
        'crop_h': crop_h, 'crop_w': crop_w
    })

standing_h = max_standing_h if max_standing_h > 50 else 300
global_scale = 300.0 / standing_h

# Canvas 384x384 with baseline at 350
final_frames_right = []
final_frames_left = []

for item in processed_info:
    cropped = item['res'][item['ymin']:item['ymax']+1, item['xmin']:item['xmax']+1]
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
        
    canvas_r = np.zeros((384, 384, 4), dtype=np.uint8)
    dst_y2 = 350
    dst_y1 = dst_y2 - new_h
    dst_x1 = max(0, (384 - new_w) // 2)
    dst_x2 = min(384, dst_x1 + new_w)
    
    res_slice = resized[:(dst_y2 - dst_y1), :(dst_x2 - dst_x1)]
    canvas_r[dst_y1:dst_y1+res_slice.shape[0], dst_x1:dst_x1+res_slice.shape[1]] = res_slice
    
    # Left version: Horizontally flipped (FLIP)
    canvas_l = cv2.flip(canvas_r, 1)
    
    final_frames_right.append((item['state'], item['idx'], canvas_r))
    final_frames_left.append((item['state'], item['idx'], canvas_l))

for d in dst_dirs:
    for side, frame_list in [('right', final_frames_right), ('left', final_frames_left)]:
        for state in ['idle', 'run', 'attack']:
            os.makedirs(os.path.join(d, side, state), exist_ok=True)
            
        for state, idx, canvas in frame_list:
            fnum = f'{idx:02d}.png'
            out_p = os.path.join(d, side, state, fnum)
            cv2.imwrite(out_p, canvas)
            
    # Also write flat 00..15 in root of NPC folder
    for i, (state, idx, canvas) in enumerate(final_frames_right):
        cv2.imwrite(os.path.join(d, f'{i:02d}.png'), canvas)
        
    print(f'[OK] Exported 16 right frames + 16 left flipped frames to {d}')

print('NPC 1 flip processing complete!')
