const canvas = document.getElementById("canvas-game");
const ctx = canvas.getContext("2d");

let soDan = 5; // Bắt đầu tối đa 5 viên
let soTien = 0;
let dangMoCauHoi = false;
let cauHoiHienTai = null;

// Nhân vật người lính cầm súng
const nguoilinh = {
  x: 50,
  y: 300,
  width: 32,
  height: 48,
  vy: 0,
  nhay: false
};

let chuongNaiVat = [];
let hopDan = [];
let hopQua = [];
let danDaBan = [];

const danhSachCauHoi = [
  {
    cauHoi: "Bác Hồ ra đi tìm đường cứu nước vào năm nào?",
    goi-y: "Sự kiện diễn ra tại Bến Nhà Rồng đầu thế kỷ 20 (giai đoạn 1910 - 1915).",
    dapAn: ["1911", "1920", "1945", "1954"],
    dung: 0
  },
  {
    cauHoi: "Bác Hồ đọc bản Tuyên ngôn Độc lập tại quảng trường nào?",
    goi-y: "Quảng trường lịch sử lớn tại thủ đô Hà Nội.",
    dapAn: ["Chiến khu Việt Bắc", "Quảng trường Ba Đình", "Bến Nhà Rồng", "Hồ Hoàn Kiếm"],
    dung: 1
  },
  {
    cauHoi: "Lời kêu gọi Toàn quốc kháng chiến được phát động vào năm nào?",
    goi-y: "Diễn ra ngay sau năm Cách mạng tháng Tám thành công (1946).",
    dapAn: ["1930", "1945", "1946", "1950"],
    dung: 2
  },
  {
    cauHoi: "Chiến dịch Điện Biên Phủ giành thắng lợi hoàn toàn vào năm nào?",
    goi-y: "Năm đánh dấu 'Lừng lẫy năm châu, chấn động địa cầu'.",
    dapAn: ["1945", "1954", "1968", "1975"],
    dung: 1
  }
];

// Điều khiển bàn phím máy tính
document.addEventListener("keydown", (e) => {
  if (dangMoCauHoi) return;
  if (e.code === "Space") nhayLen();
  if (e.code === "KeyF") banSung();
});

// Hành động Nhảy
function nhayLen() {
  if (dangMoCauHoi) return;
  if (!nguoilinh.nhay) {
    nguoilinh.vy = -11;
    nguoilinh.nhay = true;
  }
}

// Hành động Bắn súng (Kiểm tra nếu còn đạn thì bắn, giảm 1 viên)
function banSung() {
  if (dangMoCauHoi) return;
  if (soDan > 0) {
    soDan--;
    capNhatGiaoDien();
    danDaBan.push({ x: nguoilinh.x + 30, y: nguoilinh.y + 18, width: 12, height: 4 });
  }
}

// Sinh chướng ngại vật, hộp đạn (tối đa 5 viên), hộp quà
setInterval(() => {
  if (dangMoCauHoi) return;

  if (Math.random() < 0.5) {
    chuongNaiVat.push({ x: 800, y: 318, width: 28, height: 30, loai: "dich" });
  } else {
    chuongNaiVat.push({ x: Math.random() * 300 + 400, y: 0, width: 20, height: 22, loai: "bom", tocDoRoi: 3 });
  }

  if (Math.random() < 0.35) {
    hopDan.push({ x: 800, y: 310, width: 20, height: 20 });
  }

  if (Math.random() < 0.25) {
    hopQua.push({ x: 800, y: 230, width: 24, height: 24 });
  }
}, 2300);

// Vòng lặp game
function veGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mặt đường hành quân
  ctx.fillStyle = "#388e3c";
  ctx.fillRect(0, 348, canvas.width, 52);

  // Vạch đích Bác Hồ phía bên phải
  ctx.fillStyle = "#fbc02d";
  ctx.font = "bold 15px Arial";
  ctx.fillText("🚩 ĐÍCH: BÁC HỒ", 660, 45);

  if (!dangMoCauHoi) {
    nguoilinh.y += nguoilinh.vy;
    nguoilinh.vy += 0.55;
    if (nguoilinh.y >= 300) {
      nguoilinh.y = 300;
      nguoilinh.nhay = false;
    }

    // Vẽ người lính cầm súng
    ctx.fillStyle = "#1b5e20";
    ctx.fillRect(nguoilinh.x, nguoilinh.y, nguoilinh.width, nguoilinh.height);
    ctx.fillStyle = "#212121";
    ctx.fillRect(nguoilinh.x + 28, nguoilinh.y + 16, 10, 4);

    // Xử lý đạn bay
    danDaBan.forEach((dan, i) => {
      dan.x += 9;
      ctx.fillStyle = "#ffeb3b";
      ctx.fillRect(dan.x, dan.y, dan.width, dan.height);

      chuongNaiVat.forEach((cnv, j) => {
        if (cnv.loai === "dich" && vaCham(dan, cnv)) {
          chuongNaiVat.splice(j, 1);
          danDaBan.splice(i, 1);
        }
      });
    });

    // Xử lý chướng ngại vật
    chuongNaiVat.forEach((cnv, index) => {
      if (cnv.loai === "bom") cnv.y += cnv.tocDoRoi;
      cnv.x -= 3.2;

      ctx.fillStyle = cnv.loai === "dich" ? "#d32f2f" : "#212121";
      ctx.fillRect(cnv.x, cnv.y, cnv.width, cnv.height);

      if (vaCham(nguoilinh, cnv)) {
        chuongNaiVat.splice(index, 1);
        soTien = Math.max(0, soTien - 15);
        capNhatGiaoDien();
      }
    });

    // Xử lý hộp đạn (RÀNG BUỘC TỐI ĐA 5 VIÊN)
    hopDan.forEach((hd, i) => {
      hd.x -= 3.2;
      ctx.fillStyle = "#ff9800";
      ctx.fillRect(hd.x, hd.y, hd.width, hd.height);

      if (vaCham(nguoilinh, hd)) {
        soDan += 2; 
        if (soDan > 5) {
          soDan = 5; // Cố định tối đa là 5 viên, không vượt quá
        }
        capNhatGiaoDien();
        hopDan.splice(i, 1);
      }
    });

    // Xử lý hộp quà lịch sử
    hopQua.forEach((hq, i) => {
      hq.x -= 3.2;
      ctx.fillStyle = "#ab47bc";
      ctx.fillRect(hq.x, hq.y, hq.width, hq.height);

      if (vaCham(nguoilinh, hq)) {
        hopQua.splice(i, 1);
        moHopQua();
      }
    });
  }

  requestAnimationFrame(veGame);
}

function vaCham(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function capNhatGiaoDien() {
  document.getElementById("so-luong-dan").innerText = soDan;
  document.getElementById("so-tien").innerText = soTien;
}

function moHopQua() {
  dangMoCauHoi = true;
  cauHoiHienTai = danhSachCauHoi[Math.floor(Math.random() * danhSachCauHoi.length)];

  document.getElementById("tieu-de-cau-hoi").innerText = "🎁 Hộp quà tri thức lịch sử";
  document.getElementById("noi-dung-cau-hoi").innerText = cauHoiHienTai.cauHoi;
  document.getElementById("khung-goi-y").classList.add("goi-y-an");

  const divDapAn = document.getElementById("danh-sach-dap-an");
  divDapAn.innerHTML = "";

  cauHoiHienTai.dapAn.forEach((da, idx) => {
    const btn = document.createElement("button");
    btn.className = "nut-dap-an";
    btn.innerText = da;
    btn.onclick = () => xuLyDapAn(idx === cauHoiHienTai.dung);
    divDapAn.appendChild(btn);
  });

  document.getElementById("hop-cau-hoi").classList.remove("an-hop");
}

function hienThiGoiY() {
  if (!dangMoCauHoi || !cauHoiHienTai) return;
  document.getElementById("text-goi-y").innerText = cauHoiHienTai["goi-y"];
  document.getElementById("khung-goi-y").classList.remove("goi-y-an");
}

function xuLyDapAn(chinhXac) {
  document.getElementById("hop-cau-hoi").classList.add("an-hop");
  dangMoCauHoi = false;

  if (chinhXac) {
    soTien += 50;
    alert("Chính xác! Bạn nhận được 50 tiền thưởng hành quân! 🪙");
  } else {
    soTien = Math.max(0, soTien - 20);
    alert("Chưa đúng rồi! Bạn bị trừ 20 tiền thưởng! ❌");
  }
  capNhatGiaoDien();
}

veGame();
