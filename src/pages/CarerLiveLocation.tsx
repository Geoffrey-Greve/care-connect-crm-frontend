import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Satellite } from "lucide-react";

// Extended staff list with locations
const mockStaffList = [
  { id: "STAFF-001", name: "Harrison", lat: -37.8136, lng: 144.9631, city: "Melbourne" },
  { id: "STAFF-002", name: "Testing", lat: -33.8688, lng: 151.2093, city: "Sydney" },
  { id: "STAFF-003", name: "John Smith", lat: -27.4698, lng: 153.0251, city: "Brisbane" },
  { id: "STAFF-004", name: "Sarah Johnson", lat: -34.9285, lng: 138.6007, city: "Adelaide" },
  { id: "STAFF-005", name: "Mike Chen", lat: -31.9505, lng: 115.8605, city: "Perth" },
  { id: "STAFF-006", name: "Emma Davis", lat: -42.8821, lng: 147.3272, city: "Hobart" },
  { id: "STAFF-007", name: "David Wilson", lat: -35.2809, lng: 149.1300, city: "Canberra" },
  { id: "STAFF-008", name: "Lisa Brown", lat: -12.4634, lng: 130.8456, city: "Darwin" },
];

// Default center: Australia
const defaultCenter = { lat: -25.2744, lng: 133.7751 };
const defaultZoom = 4;

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    initGoogleMap: () => void;
  }
}

export default function CarerLiveLocation() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const selectedStaff = mockStaffList.find(s => s.id === selectedStaffId);

  // Load Google Maps script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      setIsMapLoaded(true);
      return;
    }

    // Get API key from environment variable
    // Note: In Vite, environment variables must be prefixed with VITE_ to be accessible
    // In your .env file, use: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    if (!apiKey) {
      console.warn("Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file");
      // Still try to load without key (will have limitations)
    }

    // Load Google Maps script
    const script = document.createElement('script');
    const apiKeyParam = apiKey ? `key=${apiKey}&` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?${apiKeyParam}libraries=places&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;

    // Set up global callback
    window.initGoogleMap = () => {
      setIsMapLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setIsMapLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      delete window.initGoogleMap;
      const scriptToRemove = document.querySelector('script[src*="maps.googleapis.com"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      mapTypeId: mapType === "satellite" ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add markers for all staff members
    markersRef.current = mockStaffList.map((staff) => {
      const marker = new window.google.maps.Marker({
        position: { lat: staff.lat, lng: staff.lng },
        map: map,
        title: staff.name,
        // label: {
        //   text: staff.name,
        //   color: "#fff",
        //   fontSize: "12px",
        //   fontWeight: "bold",
        // },
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${staff.name}</h3>
            <p style="margin: 0; color: #666;">${staff.city}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">
              Lat: ${staff.lat.toFixed(4)}, Lng: ${staff.lng.toFixed(4)}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        setSelectedStaffId(staff.id);
      });

      return marker;
    });

    // Cleanup markers on unmount
    return () => {
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [isMapLoaded]);

  // Update map type when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    mapInstanceRef.current.setMapTypeId(
      mapType === "satellite"
        ? window.google.maps.MapTypeId.SATELLITE
        : window.google.maps.MapTypeId.ROADMAP
    );
  }, [mapType]);

  // Center map on selected staff member
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStaff || !window.google) return;

    const position = { lat: selectedStaff.lat, lng: selectedStaff.lng };
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);

    // Highlight selected staff marker
    markersRef.current.forEach((marker, index) => {
      const staff = mockStaffList[index];
      if (staff.id === selectedStaffId) {
        marker.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(50, 50),
        });
        marker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
      } else {
        marker.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        });
        marker.setZIndex(window.google.maps.Marker.MAX_ZINDEX);
      }
    });
  }, [selectedStaffId, selectedStaff]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <h1 className="text-2xl font-bold">Carer Live Location</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Staff Selector Overlay */}
        <div className="absolute top-2 left-2 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Staff</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStaffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map View Toggle Overlay */}
        <div className="absolute top-2 right-16 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-2">
              <div className="flex gap-1">
                <Button
                  variant={mapType === "roadmap" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMapType("roadmap")}
                  className="h-8"
                >
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </Button>
                <Button
                  variant={mapType === "satellite" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMapType("satellite")}
                  className="h-8"
                >
                  <Satellite className="h-4 w-4 mr-1" />
                  Satellite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading State */}
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-0">
            <div className="text-center space-y-4 max-w-md p-6">
              <p className="text-lg font-medium text-muted-foreground">
                Loading map...
              </p>
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="text-sm text-muted-foreground space-y-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800">Google Maps API Key Required</p>
                  <p className="text-yellow-700">
                    To use Google Maps, please add your API key to the <code className="bg-yellow-100 px-1 rounded">.env</code> file:
                  </p>
                  <code className="block bg-yellow-100 p-2 rounded text-xs text-left">
                    VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
                  </code>
                  <p className="text-xs text-yellow-600 mt-2">
                    <strong>Note:</strong> In Vite, environment variables must be prefixed with <code>VITE_</code> to be accessible in the frontend.
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Get your API key from:{" "}
                    <a
                      href="https://console.cloud.google.com/google/maps-apis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
