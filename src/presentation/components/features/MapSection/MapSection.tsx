"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { FaLocationCrosshairs } from "react-icons/fa6";
import MarkerPopup from "./MarkerPopup";
import { getAllStationsUseCase } from "@/application/usecases/station/GetAllStations.usecase";
import { stationRepositoryAPI } from "@/infrastructure/repositories/StationRepositoryAPI.impl";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { setMapView, setUserLocation } from "@/application/slices/mapSlice";

export default function MapSection() {
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { center, zoom, userLocation } = useAppSelector((state) => state.map);

  // Map DOM reference and instance
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  // Stations layer for managing station markers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stationsLayerRef = useRef<any>(null);

  // User location marker state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null);

  // Stations data from API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stations, setStations] = useState<any[]>([]);

  // Fetch stations data on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getAllStationsUseCase(stationRepositoryAPI);
        setStations(stationsData);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStations();
  }, []);

  // Get and display user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation API");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (map) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const L = (window as any).L;

          // Remove existing user location marker
          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }

          // Create custom user location icon
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          // Add new user location marker
          const newMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(
              '<div class="text-center"><strong>You are here</strong></div>'
            );

          setUserLocationMarker(newMarker);
          map.setView([latitude, longitude], 15);

          // Save to Redux
          dispatch(setUserLocation({ latitude, longitude }));
          dispatch(setMapView({ center: [latitude, longitude], zoom: 15 }));
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

  // Initialize map with user location or default location
  const initializeMapWithLocation = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Check if map is already initialized - PREVENT DUPLICATE INITIALIZATION
    if (mapInstanceRef.current) {
      console.log("Map already initialized, skipping re-initialization");
      return;
    }

    // Helper function to setup map
    const setupMap = (initialCenter: [number, number], initialZoom: number) => {
      const mapInstance = L.map(mapRef.current).setView(
        initialCenter,
        initialZoom
      );
      mapInstanceRef.current = mapInstance;

      // Add tile layer
      L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
      ).addTo(mapInstance);

      // Create layer group for station markers
      stationsLayerRef.current = L.layerGroup().addTo(mapInstance);

      // Save map view changes to Redux (with debounce to avoid infinite loop)
      let moveEndTimeout: NodeJS.Timeout;
      mapInstance.on("moveend", () => {
        clearTimeout(moveEndTimeout);
        moveEndTimeout = setTimeout(() => {
          const newCenter = mapInstance.getCenter();
          const newZoom = mapInstance.getZoom();
          dispatch(
            setMapView({
              center: [newCenter.lat, newCenter.lng],
              zoom: newZoom,
            })
          );
        }, 300); // Debounce 300ms
      });

      return mapInstance;
    };

    // If we have saved user location in Redux, use it
    if (userLocation) {
      const mapInstance = setupMap(
        [userLocation.latitude, userLocation.longitude],
        zoom
      );

      // Restore user location marker
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
      })
        .addTo(mapInstance)
        .bindPopup(
          '<div class="text-center"><strong>You are here</strong></div>'
        );

      setUserLocationMarker(marker);
      return;
    }

    // Try to get user location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapInstance = setupMap([latitude, longitude], 15);

          // Add user location marker
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstance)
            .bindPopup(
              '<div class="text-center"><strong>You are here</strong></div>'
            );

          setUserLocationMarker(marker);

          // Save to Redux
          dispatch(setUserLocation({ latitude, longitude }));
          dispatch(setMapView({ center: [latitude, longitude], zoom: 15 }));
        },
        (error) => {
          console.log(
            "Could not get user location, using saved or default location:",
            error
          );
          // Use saved center from Redux or default
          setupMap(center, zoom);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    } else {
      // No geolocation support, use saved center from Redux
      setupMap(center, zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Only depend on dispatch to avoid re-initialization

  // Initialize Leaflet map once
  useEffect(() => {
    // Wait for Leaflet to be loaded
    const checkLeafletAndInitialize = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L) {
        console.warn("Leaflet chưa được load, đợi...");
        // Retry after a short delay
        setTimeout(checkLeafletAndInitialize, 100);
        return;
      }

      // Only initialize if not already initialized
      if (mapRef.current && !mapInstanceRef.current) {
        initializeMapWithLocation();
      }
    };

    checkLeafletAndInitialize();

    // Cleanup when component unmounts - IMPORTANT to prevent "already initialized" error
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        stationsLayerRef.current = null;
      }
    };
  }, [initializeMapWithLocation]);

  // Render station markers when stations data changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    const layer = stationsLayerRef.current;

    // Wait for Leaflet to be ready
    if (!L) {
      console.warn("Leaflet not ready yet for rendering stations");
      return;
    }

    if (!map || !layer) return;

    // Clear existing station markers
    layer.clearLayers();

    // Create custom eSwap location icon
    const eSwapLocationIcon = L.icon({
      iconUrl: "/locationEswap.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add marker for each station
    stations.forEach((station) => {
      // Create React popup component
      const popupDiv = document.createElement("div");
      const root = createRoot(popupDiv);
      root.render(
        <MarkerPopup
          stationName={station.stationName}
          address={station.stationLocation}
          status={(station.batteryInSlots ?? 0) > 0}
          availableSlots={station.batteryInSlots ?? 0}
          totalSlots={station.slotNumber}
        />
      );

      // Create marker with custom icon and popup
      const marker = L.marker([station.latitude, station.longitude], {
        icon: eSwapLocationIcon,
      }).bindPopup(popupDiv);

      // Store root for potential cleanup
      (marker as unknown as { _popupRoot?: unknown })._popupRoot = root;
      layer.addLayer(marker);
    });

    // Fit map bounds to show all stations if no user location
    if (stations.length > 0 && !userLocationMarker) {
      const group = new L.featureGroup(
        stations.map((s) => L.marker([s.latitude, s.longitude]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [stations, userLocationMarker]);

  return (
    <div className="bg-blue-50 h-full rounded-2xl shadow-md border border-blue-100">
      <div className="relative h-full w-full rounded-xl overflow-hidden">
        {/* Map container */}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>

        {/* Control buttons overlay */}
        <div className="absolute top-2 right-2 z-2000 flex gap-2 pointer-events-auto">
          {/* Get user location button */}
          <button
            onClick={getUserLocation}
            className="w-10 h-10 bg-gray-500 bg-opacity-50 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
            title="Vị trí của tôi"
          >
            <FaLocationCrosshairs size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
