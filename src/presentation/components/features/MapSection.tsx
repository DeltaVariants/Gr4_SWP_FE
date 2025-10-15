"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import listOfStations from "../../data/listOfStations";
import { FaLocationCrosshairs } from "react-icons/fa6";

const stations = listOfStations;

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [routingControl, setRoutingControl] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // Hàm lấy vị trí người dùng
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation API");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // In tọa độ ra console
        console.log("Vị trí của bạn:", {
          latitude: latitude,
          longitude: longitude,
          accuracy: position.coords.accuracy + " meters",
        });

        const map = mapInstanceRef.current;
        if (map) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const L = (window as any).L;

          // Xóa marker cũ nếu có
          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }

          // Tạo custom icon cho vị trí người dùng
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: '<div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

          // Thêm marker mới
          const newMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(
              '<div class="text-center"><strong>You are here</strong></div>'
            );

          setUserLocationMarker(newMarker);

          // Lưu vị trí người dùng để dùng cho routing
          setUserLocation([latitude, longitude]);

          // Di chuyển bản đồ đến vị trí người dùng
          map.setView([latitude, longitude], 13);
        }
      },
      (error) => {
        console.error("Lỗi khi lấy vị trí:", error);
        alert(
          "Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Hàm tạo chỉ đường đến trạm
  const createRoute = useCallback(
    (stationLat: number, stationLng: number) => {
      const map = mapInstanceRef.current;
      if (!map || !userLocation) {
        alert("Vui lòng lấy vị trí của bạn trước khi tạo chỉ đường!");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;

      // Xóa route cũ nếu có
      if (routingControl) {
        map.removeControl(routingControl);
      }

      // Tạo routing control mới
      const newRoutingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]), // Điểm A: vị trí người dùng
          L.latLng(stationLat, stationLng), // Điểm B: trạm được chọn
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: function () {
          return null; // Không tạo marker mặc định vì đã có marker riêng
        },
        lineOptions: {
          styles: [{ color: "#3B82F6", weight: 5, opacity: 0.8 }],
        },
        show: false, // Ẩn panel hướng dẫn mặc định
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      }).addTo(map);

      setRoutingControl(newRoutingControl);
    },
    [userLocation, routingControl]
  );

  // Hàm xóa route
  const clearRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (routingControl && map) {
      map.removeControl(routingControl);
      setRoutingControl(null);
    }
  }, [routingControl]);

  useEffect(() => {
    // Sử dụng Leaflet với OpenStreetMap (miễn phí, không cần API key)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet chưa được load!");
      return;
    }

    if (!mapRef.current) return;

    // Tạo map với OpenStreetMap
    const mapInstance = L.map(mapRef.current).setView(
      [10.762622, 106.660172],
      14
    );
    mapInstanceRef.current = mapInstance;

    // Thêm OpenStreetMap tiles (miễn phí)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    // Thêm markers cho các trạm
    stations.forEach((station) => {
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg mb-2">${station.name}</h3>
          <p class="text-sm text-gray-600 mb-1">${station.address}</p>
          <p class="text-sm ${
            station.available ? "text-green-600" : "text-red-600"
          } mb-2">
            ${station.available ? "✅ Đang hoạt động" : "❌ Không hoạt động"}
          </p>
          <p class="text-sm text-blue-600 mb-3">
            Còn trống: ${station.availableSlots}/${station.totalSlots} chỗ
          </p>
          <div class="flex gap-2">
            <button 
              onclick="window.createRoute(${station.lat}, ${station.lng})"
              class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              🗺️ Chỉ đường
            </button>
            <button 
              onclick="window.clearRoute()"
              class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              ❌ Xóa route
            </button>
          </div>
        </div>
      `;

      L.marker([station.lat, station.lng])
        .addTo(mapInstance)
        .bindPopup(popupContent);
    });

    // Hàm zoom để hiển thị tất cả trạm
    const handleViewAll = () => {
      const group = new L.featureGroup(
        stations.map((station) => L.marker([station.lat, station.lng]))
      );
      mapInstance.fitBounds(group.getBounds().pad(0.1));
    };

    // Thêm event listener cho nút
    const viewAllBtn = document.querySelector(".view-all-station-btn");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", handleViewAll);
    }

    return () => {
      if (viewAllBtn) {
        viewAllBtn.removeEventListener("click", handleViewAll);
      }
      mapInstance.remove();
    };
  }, []);

  // Expose functions to global window for popup buttons
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).createRoute = createRoute;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clearRoute = clearRoute;

    return () => {
      // Clean up global functions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).createRoute;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).clearRoute;
    };
  }, [createRoute, clearRoute]);

  return (
    <div className="bg-blue-50 rounded-2xl p-4 shadow-md border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          eSwap Station Map
        </h2>
        <div className="flex gap-2">
          <button
            onClick={getUserLocation}
            className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            title="Vị trí của tôi"
          >
            <FaLocationCrosshairs size={20} />
          </button>
          <button
            onClick={clearRoute}
            className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            title="Xóa chỉ đường"
          >
            ❌
          </button>
          <button className="view-all-station-btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
            Xem tất cả trạm
          </button>
        </div>
      </div>
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      </div>
    </div>
  );
}
