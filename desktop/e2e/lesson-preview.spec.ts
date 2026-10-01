import {test,expect} from '@playwright/test';
test('studio preview follows the saved lesson instead of always showing C and G',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('aurynote.studio.v1'))localStorage.setItem('aurynote.studio.v1',JSON.stringify({version:2,level:1}));});
 await page.goto('/');
 const preview=page.getByRole('region',{name:'Notes in your next lesson'});
 await expect(preview.locator('.studio-note strong')).toHaveText(['C','E','G']);
 await expect(preview.locator('.introduced strong')).toHaveText(['E']);
 await page.locator('.studio-lesson-card').screenshot({path:'artifacts/lesson-card.png',animations:'disabled'});
 await page.evaluate(()=>localStorage.setItem('aurynote.studio.v1',JSON.stringify({version:2,level:4})));
 await page.reload();
 await expect(preview.locator(".studio-note")).toHaveCount(12);
 await page.locator(".studio-lesson-card").screenshot({path:"artifacts/full-octave-card.png",animations:"disabled"});
});
