// Danh sách các trạm hoán đổi pin tại TP.HCM (mock data)
export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  available: boolean;
  totalSlots: number;
  availableSlots: number;
}

const listOfStations: Station[] = [
  {
    id: "1",
    name: "Trạm Quận 1 - Nguyễn Huệ",
    lat: 10.7744,
    lng: 106.7009,
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    available: true,
    totalSlots: 10,
    availableSlots: 7,
  },
  {
    id: "2",
    name: "Trạm Quận 3 - Võ Văn Tần",
    lat: 10.7826,
    lng: 106.6929,
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    available: true,
    totalSlots: 8,
    availableSlots: 3,
  },
  {
    id: "3",
    name: "Trạm Quận 7 - Phú Mỹ Hưng",
    lat: 10.7285,
    lng: 106.7175,
    address: "789 Nguyễn Lương Bằng, Quận 7, TP.HCM",
    available: false,
    totalSlots: 12,
    availableSlots: 0,
  },
  {
    id: "4",
    name: "Trạm Thủ Đức - Lê Văn Việt",
    lat: 10.8508,
    lng: 106.7718,
    address: "321 Lê Văn Việt, Thủ Đức, TP.HCM",
    available: true,
    totalSlots: 15,
    availableSlots: 12,
  },
  {
    id: "5",
    name: "Trạm Tân Bình - Cộng Hòa",
    lat: 10.8003,
    lng: 106.6549,
    address: "654 Cộng Hòa, Tân Bình, TP.HCM",
    available: true,
    totalSlots: 6,
    availableSlots: 2,
  },
  {
    id: "6",
    name: "Trạm Trung tâm y tế TP Dĩ An",
    lat: 10.910765558087178,
    lng: 106.78155966883557,
    address: "Trung tâm y tế TP Dĩ An, Bình Dương",
    available: true,
    totalSlots: 10,
    availableSlots: 5,
  },
  {
    id: "7",
    name: "Trạm Nhà văn hóa sinh viên",
    lat: 10.876066690799608,
    lng: 106.80047851351536,
    address: "Nhà văn hóa sinh viên, TP.HCM",
    available: true,
    totalSlots: 8,
    availableSlots: 6,
  },
  {
    id: "8",
    name: "Trạm Suối Tiên",
    lat: 10.866941430667003,
    lng: 106.80293096653006,
    address: "Suối Tiên, TP.HCM",
    available: true,
    totalSlots: 10,
    availableSlots: 8,
  },
  {
    id: "9",
    name: "Trạm Nông Lâm",
    lat: 10.867409185692253,
    lng: 106.78788077931179,
    address: "Nông Lâm, TP.HCM",
    available: true,
    totalSlots: 10,
    availableSlots: 7,
  },
  {
    id: "10",
    name: "Trạm ĐH FPT",
    lat: 10.841186248525752,
    lng: 106.80985994267522,
    address: "Đại học FPT, TP.HCM",
    available: true,
    totalSlots: 10,
    availableSlots: 10,
  },
];

export default listOfStations;
