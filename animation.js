// ANIMASI LIVE PRODUCTION LINE (GERAK KARDUS 3D KONVEYOR)
function runProductionLineAnimation() {
    const boxes = document.querySelectorAll('.box-3d-wrapper');
    if (boxes.length === 0) return;
    
    let positions = [0, -300, -600]; // Jarak antar kardus 3D
    
    setInterval(() => {
        const stage = document.querySelector('.production-stage');
        if (!stage) return;
        const stageWidth = stage.offsetWidth;
        
        boxes.forEach((box, index) => {
            positions[index] += 3; // Kecepatan gerak kardus
            
            // Jika kardus sudah masuk penuh ke pintu keluar di sebelah kiri, reset ke pintu masuk di sebelah kanan
            if (positions[index] > stageWidth - 50) {
                positions[index] = -160;
            }
            
            box.style.left = positions[index] + 'px';
        });
    }, 20);
}

window.addEventListener('DOMContentLoaded', () => {
    runProductionLineAnimation();
});