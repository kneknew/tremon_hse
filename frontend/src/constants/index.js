const WORKSHOP_DATA = {
  'Xưởng Cũ': {
    layout: 'M 50 50 L 450 50 L 450 350 L 50 350 Z',
    zones: [
      { id: 'z1', name: 'Khu vực Máy tiện', x: 100, y: 100, w: 120, h: 80 },
      { id: 'z2', name: 'Kho vật tư', x: 300, y: 100, w: 100, h: 150 },
      { id: 'z3', name: 'Đóng gói', x: 100, y: 250, w: 150, h: 70 },
    ]
  },
  'Xưởng Mới': {
    layout: 'M 20 20 L 480 20 L 480 380 L 250 380 L 250 300 L 20 300 Z',
    zones: [
      { id: 'z1', name: 'Dây chuyền SMT', x: 50, y: 50, w: 300, h: 100 },
      { id: 'z2', name: 'Khu kiểm thử', x: 380, y: 50, w: 80, h: 200 },
      { id: 'z3', name: 'Logistics', x: 50, y: 180, w: 150, h: 100 },
    ]
  },
  'Xưởng Ruột': {
    layout: 'M 100 20 L 400 20 L 480 150 L 480 250 L 400 380 L 100 380 L 20 250 L 20 150 Z',
    zones: [
      { id: 'z1', name: 'Lõi điều hành', x: 150, y: 120, w: 200, h: 160 },
      { id: 'z2', name: 'Trạm cấp phôi', x: 50, y: 180, w: 80, h: 40 },
      { id: 'z3', name: 'Trạm ra hàng', x: 370, y: 180, w: 80, h: 40 },
    ]
  }
};

const MOCK_AUDITS = [
  { id: 1, title: 'Kiểm tra 5S Định kỳ', status: 'Hoàn thành', progress: 100, date: '20/03/2026' },
  { id: 2, title: 'Checklist MSDS Toàn xưởng', status: 'Đang chạy', progress: 45, date: '22/03/2026' },
];
export { WORKSHOP_DATA, MOCK_AUDITS };