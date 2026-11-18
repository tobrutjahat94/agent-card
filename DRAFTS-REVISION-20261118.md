# Aturan revisi draf X AgentCard — koreksi user 18 Nov 2026 ~20:09 WIB (mengikat)

Status: **SEMUA draf (D1–D5) JANGAN diposting dulu.** Versi revisi ditempel HANYA setelah kontrak mainnet deploy + BscScan "Source Code Verified". Alamat kontrak + link BscScan + link prompt agent yang beneran dimasukkan saat itu.

## D1–D2 (pre-deploy)
- "29 holders to go" SALAH. Belum ada yang register → butuh 30. Angka sisa baru boleh dipakai kalau sudah ada yang register, dan ambil dari data on-chain pas posting.
- D1 "your .ai name becomes an on-chain card" menyesatkan: kontrak nyimpen tokenId, bukan nama. Ganti jadi "your Agent ID token".
- Teaser sebelum deploy itu lemah: kontrak belum ada, orang cuma disuruh percaya. Aman-nya skip, atau cukup link repo tanpa ajakan register.

## D3–D5
- D3 WAJIB cantumkan alamat kontrak + link BscScan verified + link ke prompt agent (bukan cuma "paste prompt"). Kalau kepanjangan, pecah jadi 2 tweet. Tanpa alamat, orang nggak bisa bedain kontrak asli dari klonan scam.
- Tambah "unaudited" di semua draf post-deploy: kontrak baru belum diaudit. Contoh kalimat: "unaudited, baca source verified-nya dulu".
- Jelaskan kartunya PUBLIK (bukan cuma permanen), dan sebut cek preview-nya: `to` = alamat AgentCard, value 0, fungsi `register`.
- D4 nyebut Sanusinakamoto.ai: identitas user sendiri dan kartunya memang publik on-chain, jadi aman — tapi itu keputusan user. Angka "29 lagi" harus cocok dengan data on-chain saat posting (lihat aturan D1–D2).
- D5 tweet 1: HAPUS "most Agent ID apps check balanceOf and stop" — hackathon baru mulai hari ini, tidak ada dasar klaim soal proyek lain.
- D5: hashtag taruh di tweet yang link-nya disubmit ke survei promosi, biar nggak ada yang dianggap kurang.
- D5 secara umum boleh dipakai, tapi JANGAN jadi alat narik holder. Hadiah 2.000 USDC itu buat postingan komunitas tentang proyek peserta, dan tidak jelas apakah peserta sendiri dihitung.

## Rekrutmen
- Posting sendiri dengan hashtag; JANGAN reply-spam di bawah postingan @BinanceWallet atau akun lain.
- JANGAN DM dingin ke orang dari daftar riset. Pesan tak diminta soal kontrak baru itu persis pola scam.
- Angka riset (BAS 182.040 / 992, Ptah #ProofOfAgent) TIDAK bisa diverifikasi user — anggap catatan builder, bukan fakta. Jangan pakai sebagai klaim di draf.

## Draf asli (19:33 WIB, sebelum revisi)
Teks persis D1–D5 ada di pesan chat utama 19:33 WIB. Jangan pakai ulang tanpa menerapkan aturan di atas + alamat/link verified.

## Aturan angka (tambahan user 18 Nov ~20:10 WIB, mengikat)
Tiap draf yang nyebut angka (jumlah kartu, "tinggal X lagi") WAJIB dicek ulang ke `totalCards()` tepat sebelum diposting — jangan dari draf yang ditulis beberapa jam sebelumnya.

## Aturan angka (tambahan user 18 Nov ~20:10 WIB)
Tiap draf yang nyebut angka (jumlah kartu, "tinggal X lagi") WAJIB dicek ulang ke `totalCards()` tepat sebelum diposting — jangan pakai angka dari draf yang ditulis beberapa jam sebelumnya.
