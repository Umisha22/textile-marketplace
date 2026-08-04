// Real CC-licensed fabric photos, one per fabric type, served directly from
// Wikimedia Commons (upload.wikimedia.org). URLs are stable, hotlink-friendly,
// and need no API key.
// To curate imagery, replace any entry with a direct Unsplash/Pexels CDN URL
// like https://images.unsplash.com/photo-<id>?w=800&q=80

export const FABRIC_TYPE_IMAGES = {
  silk: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Rajshahi_silk_fabric%2C_Sopura_Silk_Mills_Ltd_%2801%29.jpg/960px-Rajshahi_silk_fabric%2C_Sopura_Silk_Mills_Ltd_%2801%29.jpg',
  satin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Satin-back_crepe_closeup.jpg/960px-Satin-back_crepe_closeup.jpg',
  chiffon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Chiffon_2162_Dress.jpg/960px-Chiffon_2162_Dress.jpg',
  georgette: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/1970s_Givenchy_cocktail_dress%2C_orange_printed_silk_chiffon_03.jpg/960px-1970s_Givenchy_cocktail_dress%2C_orange_printed_silk_chiffon_03.jpg',
  organza: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Organza_fabric.jpg/960px-Organza_fabric.jpg',
  jacquard: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Quatrefoil_jacquard_fabric_disp_8k_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.jpg/960px-Quatrefoil_jacquard_fabric_disp_8k_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.jpg',
  poplin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Green_Poplin_Skirt_by_Sybil_Connolly-_Detail.jpg/960px-Green_Poplin_Skirt_by_Sybil_Connolly-_Detail.jpg',
  muslin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Blue_jamdani.JPG/960px-Blue_jamdani.JPG',
  canvas: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Linen_canvas.jpg/960px-Linen_canvas.jpg',
  twill: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Herringbone.jpg/960px-Herringbone.jpg',
  velvet: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Green_velvet_fabric.jpg/960px-Green_velvet_fabric.jpg',
  crepe: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Woman%27s_nagajuban_%28detail%29%2C_japan%2C_1890-1910%2C_silk%2C_crepe_weave%2C_hand-painted%2C_paste-resist_dyed%2C_Honolulu_Museum_of_Art.jpg/960px-Woman%27s_nagajuban_%28detail%29%2C_japan%2C_1890-1910%2C_silk%2C_crepe_weave%2C_hand-painted%2C_paste-resist_dyed%2C_Honolulu_Museum_of_Art.jpg',
  broadcloth: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Blue_Cotton_Fabric_Texture_Free_Creative_Commons_%286962342861%29.jpg/960px-Blue_Cotton_Fabric_Texture_Free_Creative_Commons_%286962342861%29.jpg',
  taffeta: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bojagi._Figured_gauze%2C_taffeta._Silk._Korea_1997._MTMAD_MT_50519.jpg/960px-Bojagi._Figured_gauze%2C_taffeta._Silk._Korea_1997._MTMAD_MT_50519.jpg',
  denim: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Clay_-_Denim_Fabric_05_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.webp/960px-Clay_-_Denim_Fabric_05_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.webp.png',
  knit: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cotton_jersey_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.png/960px-Cotton_jersey_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.png',
  lace: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lace_Trimming.JPG/960px-Lace_Trimming.JPG',
  blends: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Cloth_800.jpg/960px-Cloth_800.jpg',
  woven: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Pink_Woven_Cotton_Silk_Fabric_Texture_Free_Creative_Commons_%286962346249%29.jpg/960px-Pink_Woven_Cotton_Silk_Fabric_Texture_Free_Creative_Commons_%286962346249%29.jpg',
  wool: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Poly_wool_herringbone_diff_8k_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.png/960px-Poly_wool_herringbone_diff_8k_%28Rico_Cilliers_and_colormass_via_Poly_Haven%29.png',
};

export const fabricImage = (fabricType) => FABRIC_TYPE_IMAGES[fabricType] || null;
