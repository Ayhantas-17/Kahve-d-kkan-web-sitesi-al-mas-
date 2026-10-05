// cart.js (Eksiksiz Sepet Mantığı)

// Örnek Ürün Veritabanı
let urunVeritabani = {
    1: { ad: "Özel Karışım 250g", fiyat: 120, resim: "images/özelkarısım2.png" },
    2: { ad: "Meyveli Yöresel Çekirdek", fiyat: 150, resim: "images/meyveli.png" },
    3: { ad: "Türk Kahvesi", fiyat: 60, resim: "images/1türkkahvesi.png" },
    4: { ad: "Ethiopia Yirgacheffe", fiyat: 180, resim: "images/filtre.png" },
    5: { ad: "Brazil Santos", fiyat: 110, resim: "images/ice-karamel-latte.jpg" },
    6: { ad: "Latte", fiyat: 130, resim: "images/ice.latte.png" },
    7: { ad: "Kafeinsiz Harman", fiyat: 100, resim: "images/kafeinsiz.jpg" },
};

// Sepeti localStorage'dan yükle
function sepetiYukle() {
    const sepetJSON = localStorage.getItem('kahveSepeti');
    return sepetJSON ? JSON.parse(sepetJSON) : [];
}

// Sepeti localStorage'a kaydet
function sepetiKaydet(sepet) {
    localStorage.setItem('kahveSepeti', JSON.stringify(sepet));
}

// Tüm sayfalardaki sepet sayacını günceller
function sepetSayaciniGuncelle() {
    const sepet = sepetiYukle();
    const toplamAdet = sepet.reduce((toplam, item) => toplam + item.adet, 0);
    const sayaclar = document.querySelectorAll('#sepet-sayaci');
    sayaclar.forEach(sayac => {
        sayac.textContent = toplamAdet;
    });
}

// Ürünü Sepete Ekle
function urunEkle(urunId) {
    const sepet = sepetiYukle();
    const urunBilgisi = urunVeritabani[urunId];
    if (!urunBilgisi) return false;

    const mevcutUrun = sepet.find(item => item.id === urunId);

    if (mevcutUrun) {
        mevcutUrun.adet++;
    } else {
        sepet.push({
            id: urunId,
            adet: 1,
            ad: urunBilgisi.ad,
            fiyat: urunBilgisi.fiyat,
            resim: urunBilgisi.resim
        });
    }
    sepetiKaydet(sepet);
    sepetSayaciniGuncelle(); // Sayacı güncelle
    return true;
}

// Sepeti Güncelle ve Render Et (Sadece sepet.html için)
function sepetiRenderEt() {
    const sepetListesi = document.getElementById('sepet-listesi');
    const toplamFiyatGosterge = document.getElementById('toplam-fiyat');
    const araToplamGosterge = document.getElementById('ara-toplam');

    if (!sepetListesi) return; // sepet.html'de değilsek devam etme

    const sepet = sepetiYukle();
    sepetListesi.innerHTML = '';
    let toplamFiyat = 0;

    if (sepet.length === 0) {
        sepetListesi.innerHTML = '<p class="text-center text-muted py-5">Sepetinizde ürün bulunmamaktadır. Hemen <a href="urunler.html">ürünlerimizi</a> inceleyin!</p>';
    } else {
        sepet.forEach(item => {
            const urunToplam = item.fiyat * item.adet;
            toplamFiyat += urunToplam;

            const sepetOgesiHTML = `
                <div class="row align-items-center border-bottom py-3" data-id="${item.id}">
                    <div class="col-2">
                        <img src="${item.resim}" class="img-fluid rounded" alt="${item.ad}">
                    </div>
                    <div class="col-5">
                        <h6 class="mb-0">${item.ad}</h6>
                        <small class="text-muted">${item.fiyat} TL / adet</small>
                    </div>
                    <div class="col-2 text-center">
                        <input type="number" class="form-control form-control-sm sepet-adet" 
                               value="${item.adet}" min="1" data-id="${item.id}">
                    </div>
                    <div class="col-2 text-end">
                        <span class="fw-bold text-danger">${urunToplam.toFixed(2)} TL</span>
                    </div>
                    <div class="col-1 text-end">
                        <button class="btn btn-sm btn-outline-danger sepet-sil" data-id="${item.id}">X</button>
                    </div>
                </div>
            `;
            sepetListesi.innerHTML += sepetOgesiHTML;
        });
    }
    
    // Toplamları güncelle
    if (araToplamGosterge) araToplamGosterge.textContent = `${toplamFiyat.toFixed(2)} TL`;
    if (toplamFiyatGosterge) toplamFiyatGosterge.textContent = `${toplamFiyat.toFixed(2)} TL`;
    
    sepetSayaciniGuncelle();
    
    // Olay Dinleyicileri Ekle (Adet ve Silme)
    sepetListesi.querySelectorAll('.sepet-adet').forEach(input => {
        // change yerine input kullanmak anlık fiyat güncellemesi sağlar
        input.addEventListener('input', sepetAdetGuncelle); 
    });
    sepetListesi.querySelectorAll('.sepet-sil').forEach(button => {
        button.addEventListener('click', sepettenSil);
    });
}

// Sepetteki Adeti Güncelle
function sepetAdetGuncelle(event) {
    const urunId = parseInt(event.target.dataset.id);
    // Adetin 1'den az olmasını engelle
    const yeniAdet = Math.max(1, parseInt(event.target.value) || 1); 
    event.target.value = yeniAdet; // Input alanını düzelt

    const sepet = sepetiYukle();
    const urun = sepet.find(item => item.id === urunId);
    
    if (urun) {
        urun.adet = yeniAdet;
        sepetiKaydet(sepet);
        sepetiRenderEt(); // Anlık fiyat güncellemesi için sepeti yeniden çiz
    }
}

// Sepetten Ürünü Sil
function sepettenSil(event) {
    const urunId = parseInt(event.target.dataset.id);
    let sepet = sepetiYukle();
    
    sepet = sepet.filter(item => item.id !== urunId);

    sepetiKaydet(sepet);
    sepetiRenderEt(); // Sepeti yeniden çiz
}


// DOM Yüklendiğinde Olay Dinleyicilerini Kur
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Ürün Ekleme Butonlarını Dinle (index.html ve urunler.html)
    const sepeteEkleButonlari = document.querySelectorAll('.sepeteEkleBtn');
    sepeteEkleButonlari.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); 
            const urunId = parseInt(this.dataset.urunId);
            
            if (urunEkle(urunId)) {
                // Ekleme başarılı, sepet sayfasına yönlendir
                alert('Ürün sepete eklendi! Sepete yönlendiriliyorsunuz.');
                window.location.href = 'sepet.html';
            }
        });
    });

    // 2. Sepet Sayacı ve Sepet Render'ı
    sepetSayaciniGuncelle();
    
    if (document.getElementById('sepet-listesi')) {
        sepetiRenderEt();
        
        // Sepeti Güncelle Butonuna da render fonksiyonunu bağla
        document.getElementById('sepet-guncelle-btn')?.addEventListener('click', sepetiRenderEt); 
    }
});