import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Map, Satellite, MapPin } from "lucide-react";

// Mock data for staff and clients
const mockStaffList = [
    { id: "STAFF-001", name: "Harrison", lat: -33.8688, lng: 151.2093, city: "Sydney" },
    { id: "STAFF-002", name: "John Smith", lat: -37.8136, lng: 144.9631, city: "Melbourne" },
    { id: "STAFF-003", name: "Sarah Johnson", lat: -27.4698, lng: 153.0251, city: "Brisbane" },
    { id: "STAFF-004", name: "Mike Chen", lat: -34.9285, lng: 138.6007, city: "Adelaide" },
    { id: "STAFF-005", name: "Emma Davis", lat: -42.8821, lng: 147.3272, city: "Hobart" },
];

const mockClientList = [
    { id: "CLIENT-001", name: "Test Test Test", lat: -33.8688, lng: 151.2093, city: "Sydney" },
    { id: "CLIENT-002", name: "Client A", lat: -37.8136, lng: 144.9631, city: "Melbourne" },
    { id: "CLIENT-003", name: "Client B", lat: -27.4698, lng: 153.0251, city: "Brisbane" },
    { id: "CLIENT-004", name: "Client C", lat: -35.2809, lng: 149.1300, city: "Canberra" },
];

// Default center: Australia
const defaultCenter = { lat: -25.2744, lng: 133.7751 };
const defaultZoom = 4;

declare global {
    interface Window {
        google: any;
        [key: string]: any;
    }
}

export default function AreaTracker() {
    const [showStaff, setShowStaff] = useState(true);
    const [showClient, setShowClient] = useState(true);
    const [selectedStaffId, setSelectedStaffId] = useState<string>("");
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

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
            // Wait for it to load
            const checkInterval = setInterval(() => {
                if (window.google && window.google.maps) {
                    setIsMapLoaded(true);
                    clearInterval(checkInterval);
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);

            return () => clearInterval(checkInterval);
        }

        // Get API key from environment variable
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

        if (!apiKey) {
            console.warn("Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file");
        }

        // Load Google Maps script
        const script = document.createElement('script');
        const apiKeyParam = apiKey ? `key=${apiKey}&` : "";
        const callbackName = `initGoogleMap_${Date.now()}`;

        script.src = `https://maps.googleapis.com/maps/api/js?${apiKeyParam}libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        // Set up global callback with unique name
        (window as any)[callbackName] = () => {
            setIsMapLoaded(true);
            delete (window as any)[callbackName];
        };

        script.onerror = () => {
            console.error("Failed to load Google Maps script");
            setIsMapLoaded(false);
            delete (window as any)[callbackName];
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup
            if ((window as any)[callbackName]) {
                delete (window as any)[callbackName];
            }
        };
    }, []);

    // Initialize map
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || !window.google?.maps) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: defaultZoom,
                mapTypeId: mapType === "satellite"
                    ? window.google.maps.MapTypeId.SATELLITE
                    : window.google.maps.MapTypeId.ROADMAP,
                fullscreenControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: true,
            });

            mapInstanceRef.current = map;

            // Update map type when changed
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setMapTypeId(
                    mapType === "satellite"
                        ? window.google.maps.MapTypeId.SATELLITE
                        : window.google.maps.MapTypeId.ROADMAP
                );
            }
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            // Cleanup markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
        };
    }, [isMapLoaded, mapType]);

    // Update markers when filters change
    useEffect(() => {
        if (!isMapLoaded || !mapInstanceRef.current || !window.google?.maps) return;

        try {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            const bounds = new window.google.maps.LatLngBounds();
            let hasMarkers = false;

            // Add staff markers
            if (showStaff) {
                const staffToShow = selectedStaffId && selectedStaffId !== "all"
                    ? mockStaffList.filter(s => s.id === selectedStaffId)
                    : mockStaffList;

                staffToShow.forEach((staff) => {
                    const position = { lat: staff.lat, lng: staff.lng };
                    bounds.extend(position);
                    hasMarkers = true;

                    const marker = new window.google.maps.Marker({
                        position,
                        map: mapInstanceRef.current,
                        title: `${staff.name} (Staff)`,
                        icon: {
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                            scaledSize: new window.google.maps.Size(40, 40),
                        },
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e40af;">${staff.name}</h3>
              <p style="margin: 0; color: #666; font-size: 12px;">Staff Member</p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">${staff.city}</p>
            </div>
          `,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(mapInstanceRef.current, marker);
                    });

                    markersRef.current.push(marker);
                });
            }

            // Add client markers
            if (showClient) {
                const clientsToShow = selectedClientId && selectedClientId !== "all"
                    ? mockClientList.filter(c => c.id === selectedClientId)
                    : mockClientList;

                clientsToShow.forEach((client) => {
                    const position = { lat: client.lat, lng: client.lng };
                    bounds.extend(position);
                    hasMarkers = true;

                    const marker = new window.google.maps.Marker({
                        position,
                        map: mapInstanceRef.current,
                        title: `${client.name} (Client)`,
                        icon: {
                            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                            scaledSize: new window.google.maps.Size(40, 40),
                        },
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #dc2626;">${client.name}</h3>
              <p style="margin: 0; color: #666; font-size: 12px;">Client</p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">${client.city}</p>
            </div>
          `,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(mapInstanceRef.current, marker);
                    });

                    markersRef.current.push(marker);
                });
            }

            // Fit bounds if we have markers
            if (hasMarkers && markersRef.current.length > 0) {
                mapInstanceRef.current.fitBounds(bounds);
            } else {
                // Reset to default view
                mapInstanceRef.current.setCenter(defaultCenter);
                mapInstanceRef.current.setZoom(defaultZoom);
            }
        } catch (error) {
            console.error("Error updating markers:", error);
        }
    }, [isMapLoaded, showStaff, showClient, selectedStaffId, selectedClientId]);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Area Tracker</h1>
                <p className="text-muted-foreground">Track staff and client locations on the map</p>
            </div>

            {/* Filter Section */}
            <div className="rounded-lg border bg-card p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Staff Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="staff-checkbox"
                                checked={showStaff}
                                onCheckedChange={(checked) => {
                                    setShowStaff(checked === true);
                                }}
                            />
                            <Label htmlFor="staff-checkbox" className="flex items-center gap-2 cursor-pointer">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                Staff
                            </Label>
                        </div>
                        {showStaff && (
                            <Select
                                value={selectedStaffId || undefined}
                                onValueChange={(value) => setSelectedStaffId(value || "")}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {mockStaffList.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Client Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="client-checkbox"
                                checked={showClient}
                                onCheckedChange={(checked) => {
                                    setShowClient(checked === true);
                                }}
                                className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 border-red-500"
                            />
                            <Label htmlFor="client-checkbox" className="flex items-center gap-2 cursor-pointer">
                                <MapPin className="h-4 w-4 text-red-500" />
                                Client
                            </Label>
                        </div>
                        {showClient && (
                            <Select
                                value={selectedClientId || undefined}
                                onValueChange={(value) => setSelectedClientId(value || "")}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    {mockClientList.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="relative">
                    {/* Map Type Controls */}
                    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white rounded-lg shadow-lg p-1">
                        <Button
                            variant={mapType === "roadmap" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMapType("roadmap")}
                            className="gap-2"
                        >
                            <Map className="h-4 w-4" />
                            Map
                        </Button>
                        <Button
                            variant={mapType === "satellite" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMapType("satellite")}
                            className="gap-2"
                        >
                            <Satellite className="h-4 w-4" />
                            Satellite
                        </Button>
                    </div>

                    {/* Map Container */}
                    <div
                        ref={mapRef}
                        className="w-full h-[600px] rounded-lg"
                        style={{ minHeight: "600px" }}
                    />

                    {/* API Key Warning */}
                    {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/90 rounded-lg">
                            <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
                                <p className="font-semibold text-yellow-800 mb-2">Google Maps API Key Required</p>
                                <p className="text-sm text-yellow-700 mb-4">
                                    To use Google Maps, please add your API key to the <code className="bg-yellow-100 px-1 rounded">.env</code> file:
                                </p>
                                <code className="block bg-yellow-100 p-2 rounded text-xs mb-4">
                                    VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="text-yellow-800 border-yellow-300"
                                >
                                    <a
                                        href="https://console.cloud.google.com/google/maps-apis"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Get API Key
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

