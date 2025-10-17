window.productsData = [
  {
    id: "prod-001",
    name: "Dầu gió xanh con Én Eagle",
    weight: "20ml",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 160000,
    price: 80000,
    unit: "VND/Chai",
  },
  {
    id: "prod-002",
    name: "Kem đánh răng P/S",
    weight: "180g",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 45000,
    price: 32000,
    unit: "VND/Tuýp",
  },
  {
    id: "prod-003",
    name: "Sữa rửa mặt Hada Labo",
    weight: "100g",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 85000,
    price: 67000,
    unit: "VND/Tuýp",
  },
  {
    id: "prod-004",
    name: "Dầu gội Head & Shoulders",
    weight: "625ml",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 145000,
    price: 118000,
    unit: "VND/Chai",
  },
  {
    id: "prod-005",
    name: "Sữa tắm Lifebuoy",
    weight: "850ml",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 175000,
    price: 139000,
    unit: "VND/Chai",
  },
  {
    id: "prod-006",
    name: "Khăn giấy Tempo Pocket",
    weight: "10 gói",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 35000,
    price: 25000,
    unit: "VND/Bịch",
  },
  {
    id: "prod-007",
    name: "Nước rửa chén Sunlight",
    weight: "750ml",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 45000,
    price: 36000,
    unit: "VND/Chai",
  },
  {
    id: "prod-008",
    name: "Bột giặt OMO Matic",
    weight: "3.7kg",
    image: "../assets/images/otiv-detail-fit.png",
    oldPrice: 205000,
    price: 179000,
    unit: "VND/Túi",
  },
];

window.getProductById = function getProductById(productId) {
  if (!Array.isArray(window.productsData)) return undefined;
  return window.productsData.find(function (p) { return p.id === productId; });
};


