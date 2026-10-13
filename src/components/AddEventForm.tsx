import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Info, X, Pencil, CalendarIcon, Clock } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

export interface AddEventFormData {
  // Client Section
  internal: boolean;
  signOff: boolean;
  geoCheckIn: boolean;
  geoCheckOut: boolean;
  clientIds: string[];
  clientAddresses: Record<string, string>; // clientId -> address
  defaultAddress: boolean;
  priceBook: string;
  keepSamePriceBook: boolean;
  multiplier: string;

  // Shift Section
  transport: boolean;
  shiftType: string;
  allowance: string;

  // Transport Section
  transportType: string; // 'self' | 'driver-allowance'
  driverId: string;
  fareType: string;
  km: string;
  amount: string;
  travelItemNumber: string;

  // Time & Location Section
  sleepover: boolean;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  repeat: boolean;
  recurrence: string; // 'daily' | 'weekly' | 'monthly'
  repeatEvery: number;
  repeatUnit: string; // 'day' | 'week' | 'month'
  occursOn: string[]; // For weekly: ['Mon', 'Thu', 'Fri']
  monthlyDate: string; // For monthly: '1' to '31'
  repeatEndDate: Date | undefined;
  splitShiftRate: boolean;
  splitShiftPriceBook: string;
  splitShiftStartDate: Date | undefined;
  splitShiftStartTime: string;
  splitShiftEndDate: Date | undefined;
  splitShiftEndTime: string;
  timeDuration: string; // Calculated field, read-only

  // Carer Section
  carerIds: string[];
  notifyCarer: string;
  payGroup: string;
  enableCarerLoginNotification: string;
  instructions: string;

  // Task Section
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    mandatory: boolean;
  }>;
}

const AddEventForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data - in real app, these would come from API or context
  const clientList: Array<{ id: string; name: string; address?: string }> = [
    { id: '1', name: 'Client 1', address: '123 Main St, City' },
    { id: '2', name: 'Client 2', address: '456 Oak Ave, City' },
  ];
  
  const carerList: Array<{ id: string; name: string }> = [
    { id: '1', name: 'Carer 1' },
    { id: '2', name: 'Carer 2' },
  ];
  const [formData, setFormData] = useState<AddEventFormData>({
    internal: false,
    signOff: false,
    geoCheckIn: false,
    geoCheckOut: false,
    clientIds: [],
    clientAddresses: {},
    defaultAddress: true,
    priceBook: '',
    keepSamePriceBook: false,
    multiplier: '1:2',
    transport: false,
    shiftType: '',
    allowance: '',
    transportType: 'self',
    driverId: '',
    fareType: '',
    km: '',
    amount: '',
    travelItemNumber: '',
    sleepover: false,
    startDate: new Date(2025, 10, 14),
    startTime: '10:51',
    endDate: new Date(2025, 10, 14),
    endTime: '16:51',
    repeat: false,
    recurrence: 'weekly',
    repeatEvery: 2,
    repeatUnit: 'week',
    occursOn: [],
    monthlyDate: '',
    repeatEndDate: undefined,
    splitShiftRate: false,
    splitShiftPriceBook: '',
    splitShiftStartDate: undefined,
    splitShiftStartTime: '',
    splitShiftEndDate: undefined,
    splitShiftEndTime: '',
    timeDuration: '00:00',
    carerIds: [],
    notifyCarer: 'Yes',
    payGroup: '',
    enableCarerLoginNotification: 'Yes',
    instructions: '',
    tasks: [],
  });

  const buildDateTime = (date?: Date, time?: string) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    return combined;
  };

  const [errors, setErrors] = useState<Partial<Record<keyof AddEventFormData, string>>>({});
  const [newTask, setNewTask] = useState({ title: '', description: '', mandatory: false });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const autocompleteRefs = useRef<Record<string, { autocomplete: any; observer: MutationObserver; cleanup: () => void }>>({});
  const addressInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const addressOnChangeHandlers = useRef<Record<string, (e: React.ChangeEvent<HTMLInputElement>) => void>>({});
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const handleInputChange = (field: keyof AddEventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (field: keyof AddEventFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleClientChange = (selected: string[]) => {
    setFormData((prev) => {
      const newAddresses = { ...prev.clientAddresses };
      // Remove addresses for unselected clients
      Object.keys(newAddresses).forEach((clientId) => {
        if (!selected.includes(clientId)) {
          delete newAddresses[clientId];
        }
      });
      // Add default addresses for newly selected clients
      selected.forEach((clientId) => {
        if (!newAddresses[clientId]) {
          const client = clientList.find((c) => c.id === clientId);
          newAddresses[clientId] = client?.address || 'Karachi City, Pakistan';
        }
      });
      return { ...prev, clientIds: selected, clientAddresses: newAddresses };
    });
  };

  const handleAddressUpdate = (clientId: string, address: string) => {
    setFormData((prev) => ({
      ...prev,
      clientAddresses: { ...prev.clientAddresses, [clientId]: address },
    }));
    setEditingClientId(null);
  };

  // Calculate time duration for split shift (max 00:59)
  const calculateTimeDuration = (startDate: Date | undefined, startTime: string, endDate: Date | undefined, endTime: string): string => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return '00:00';
    }

    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const start = new Date(startDate);
      start.setHours(startHours, startMinutes, 0, 0);

      const end = new Date(endDate);
      end.setHours(endHours, endMinutes, 0, 0);

      const diffMs = end.getTime() - start.getTime();
      if (diffMs < 0) return '00:00';

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      // Cap at 00:59 as per requirement
      if (hours > 0 || minutes > 59) {
        return '00:59';
      }

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
  };

  // Update time duration when split shift dates/times change
  useEffect(() => {
    if (formData.splitShiftRate) {
      const duration = calculateTimeDuration(
        formData.splitShiftStartDate,
        formData.splitShiftStartTime,
        formData.splitShiftEndDate,
        formData.splitShiftEndTime
      );
      if (duration !== formData.timeDuration) {
        setFormData((prev) => ({ ...prev, timeDuration: duration }));
      }
    }
  }, [formData.splitShiftStartDate, formData.splitShiftStartTime, formData.splitShiftEndDate, formData.splitShiftEndTime, formData.splitShiftRate]);

  // Sync input values with React state after autocomplete selection
  useEffect(() => {
    if (editingClientId) {
      const reactInput = addressInputRefs.current[editingClientId];
      const currentAddress = formData.clientAddresses[editingClientId] || '';

      console.log('Sync effect - editingClientId:', editingClientId, 'currentAddress:', currentAddress, 'inputValue:', reactInput?.value);

      if (reactInput && currentAddress) {
        // Always sync the input value with React state
        if (reactInput.value !== currentAddress) {
          console.log('Syncing input value from', reactInput.value, 'to', currentAddress);

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(reactInput, currentAddress);
          } else {
            reactInput.value = currentAddress;
          }

          // Trigger React's onChange handler
          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          Object.defineProperty(inputEvent, 'target', {
            writable: false,
            value: reactInput,
          });
          reactInput.dispatchEvent(inputEvent);
        }
      }
    }
  }, [formData.clientAddresses, editingClientId]);

  // Load Google Maps Places API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found. Address autocomplete will not work.');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Load Google Maps script if not already loaded
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      // Script is loading, wait for it
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsGoogleMapsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      return () => clearInterval(checkGoogleMaps);
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete for address fields
  useEffect(() => {
    if (!isGoogleMapsLoaded || !window.google?.maps?.places) return;

    // Clean up previous autocomplete instances
    Object.keys(autocompleteRefs.current).forEach((clientId) => {
      if (editingClientId !== clientId && autocompleteRefs.current[clientId]) {
        // Clean up event listeners and observer
        autocompleteRefs.current[clientId].cleanup();
        delete autocompleteRefs.current[clientId];
      }
    });

    // Initialize autocomplete for the currently editing client
    if (editingClientId) {
      const currentEditingClientId = editingClientId; // Capture in closure
      const inputId = `address-input-${currentEditingClientId}`;
      // Use setTimeout to ensure the DOM element is rendered
      setTimeout(() => {
        const inputElement = document.getElementById(inputId) as HTMLInputElement;

        if (inputElement && !autocompleteRefs.current[currentEditingClientId]) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            types: ['address'],
          });

          // Style and position the autocomplete dropdown
          const styleDropdown = () => {
            const pacContainer = document.querySelector('.pac-container') as HTMLElement;
            if (pacContainer && inputElement) {
              const rect = inputElement.getBoundingClientRect();
              pacContainer.style.zIndex = '9999';
              pacContainer.style.position = 'absolute';
              pacContainer.style.top = `${rect.bottom + window.scrollY}px`;
              pacContainer.style.left = `${rect.left + window.scrollX}px`;
              pacContainer.style.width = `${inputElement.offsetWidth}px`;
              pacContainer.style.borderRadius = '0.375rem';
              pacContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              pacContainer.style.marginTop = '2px';
              pacContainer.style.backgroundColor = 'white';
            }
          };

          // Initial styling
          setTimeout(styleDropdown, 150);

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.formatted_address) return;
          
            const formatted = place.formatted_address;
          
            setFormData(prev => ({
              ...prev,
              clientAddresses: {
                ...prev.clientAddresses,
                [currentEditingClientId]: formatted
              }
            }));
          });
          

          // Update dropdown position when input is focused, typed, or window events
          const updateDropdownPosition = () => {
            styleDropdown();
          };

          // Use a mutation observer to watch for pac-container creation
          const observer = new MutationObserver(() => {
            styleDropdown();
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          inputElement.addEventListener('focus', updateDropdownPosition);
          inputElement.addEventListener('input', updateDropdownPosition);
          const resizeHandler = () => updateDropdownPosition();
          const scrollHandler = () => updateDropdownPosition();
          window.addEventListener('resize', resizeHandler);
          window.addEventListener('scroll', scrollHandler, true);

          // Store cleanup functions
          autocompleteRefs.current[editingClientId] = {
            autocomplete,
            observer,
            cleanup: () => {
              inputElement.removeEventListener('focus', updateDropdownPosition);
              inputElement.removeEventListener('input', updateDropdownPosition);
              window.removeEventListener('resize', resizeHandler);
              window.removeEventListener('scroll', scrollHandler);
              observer.disconnect();
            },
          };
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      // Remove event listeners if needed
      if (editingClientId) {
        const inputElement = document.getElementById(`address-input-${editingClientId}`) as HTMLInputElement;
        if (inputElement) {
          inputElement.removeEventListener('focus', () => { });
          inputElement.removeEventListener('input', () => { });
        }
      }
    };
  }, [isGoogleMapsLoaded, editingClientId]);

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        variant: 'destructive',
      });
      return;
    }

    const task = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTask.title,
      description: newTask.description,
      mandatory: newTask.mandatory,
    };

    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));

    setNewTask({ title: '', description: '', mandatory: false });

    toast({
      title: 'Task Added',
      description: 'Task has been added successfully.',
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));

    toast({
      title: 'Task Deleted',
      description: 'Task has been removed successfully.',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddEventFormData, string>> = {};

    if (!formData.internal) {
      if (formData.clientIds.length === 0) newErrors.clientIds = 'At least one client is required';
      if (!formData.priceBook) newErrors.priceBook = 'Price Book is required';
      if (!formData.multiplier) newErrors.multiplier = 'Multiplier is required';
    }
    if (!formData.shiftType) newErrors.shiftType = 'Shift Type is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start Time is required';
    if (!formData.endDate) newErrors.endDate = 'End Date is required';
    if (!formData.endTime) newErrors.endTime = 'End Time is required';
    if (formData.carerIds.length === 0) newErrors.carerIds = 'At least one carer is required';
    if (!formData.payGroup) newErrors.payGroup = 'Pay Group is required';

    const startDateTime = buildDateTime(formData.startDate, formData.startTime);
    const endDateTime = buildDateTime(formData.endDate, formData.endTime);

    if (startDateTime && endDateTime) {
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'End time must be after start time';
      } else {
        const diffHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
        if (diffHours >= 24) {
          newErrors.endTime = 'Leave duration must be less than 24 hours';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Handle form submission - in real app, this would call an API
    console.log('Form submitted:', formData);
    toast({
      title: 'Success',
      description: 'Event has been created successfully.',
    });
    
    // Navigate back to panel after successful submission
    navigate('/panel');
  };

  const handleClose = () => {
    navigate('/panel');
  };

  const resetForm = () => {
    setFormData({
      internal: false,
      signOff: false,
      geoCheckIn: false,
      geoCheckOut: false,
      clientIds: [],
      clientAddresses: {},
      defaultAddress: true,
      priceBook: '',
      keepSamePriceBook: false,
      multiplier: '1:2',
      transport: false,
      shiftType: '',
      allowance: '',
      transportType: 'self',
      driverId: '',
      fareType: '',
      km: '',
      amount: '',
      travelItemNumber: '',
      sleepover: false,
      startDate: new Date(2025, 10, 14),
      startTime: '10:51',
      endDate: new Date(2025, 10, 14),
      endTime: '16:51',
      repeat: false,
      recurrence: 'weekly',
      repeatEvery: 2,
      repeatUnit: 'week',
      occursOn: [],
      monthlyDate: '',
      repeatEndDate: undefined,
      splitShiftRate: false,
      splitShiftPriceBook: '',
      splitShiftStartDate: undefined,
      splitShiftStartTime: '',
      splitShiftEndDate: undefined,
      splitShiftEndTime: '',
      timeDuration: '00:00',
      carerIds: [],
      notifyCarer: 'Yes',
      payGroup: '',
      enableCarerLoginNotification: 'Yes',
      instructions: '',
      tasks: [],
    });
    setErrors({});
    setNewTask({ title: '', description: '', mandatory: false });
  };

  return (
    <div className="container mx-auto p-6 w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Add Event</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 py-4">
          {/* Client Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Client</h3>

              {/* Checkboxes Row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internal"
                    checked={formData.internal}
                    onCheckedChange={(checked) => handleCheckboxChange('internal', checked as boolean)}
                  />
                  <Label htmlFor="internal" className="cursor-pointer">Internal</Label>
                </div>

                <div className="flex items-center gap-x-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signOff"
                      checked={formData.signOff}
                      onCheckedChange={(checked) => handleCheckboxChange('signOff', checked as boolean)}
                    />
                    <Label htmlFor="signOff" className="cursor-pointer">Sign Off</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geoCheckIn"
                      checked={formData.geoCheckIn}
                      onCheckedChange={(checked) => handleCheckboxChange('geoCheckIn', checked as boolean)}
                    />
                    <Label htmlFor="geoCheckIn" className="cursor-pointer">Geo Check-In</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geoCheckOut"
                      checked={formData.geoCheckOut}
                      onCheckedChange={(checked) => handleCheckboxChange('geoCheckOut', checked as boolean)}
                    />
                    <Label htmlFor="geoCheckOut" className="cursor-pointer">Geo Check-Out</Label>
                  </div>
                </div>

              </div>
            </div>

            {/* Two Column Layout */}
            {!formData.internal && (
              <div className="space-y-4">
                {/* Choose Client */}
                <div className="space-y-2">
                  <Label htmlFor="clientIds">Choose Client *</Label>
                  <MultiSelect
                    options={clientList.map((client) => ({
                      label: client.name,
                      value: client.id,
                    }))}
                    selected={formData.clientIds}
                    onChange={handleClientChange}
                    placeholder="Choose Client"
                  />
                  {errors.clientIds && <p className="text-sm text-destructive">{errors.clientIds}</p>}
                </div>

                {/* Multiplier and Price Book in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="multiplier">Multiplier *</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Select value={formData.multiplier} onValueChange={(value) => handleInputChange('multiplier', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Price Ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:2">1:2</SelectItem>
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="1.5:1">1.5:1</SelectItem>
                        <SelectItem value="2:1">2:1</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.multiplier && <p className="text-sm text-destructive">{errors.multiplier}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="priceBook">Price Book *</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Select value={formData.priceBook} onValueChange={(value) => handleInputChange('priceBook', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priceBook && <p className="text-sm text-destructive">{errors.priceBook}</p>}
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="keepSamePriceBook"
                        checked={formData.keepSamePriceBook}
                        onCheckedChange={(checked) => handleCheckboxChange('keepSamePriceBook', checked as boolean)}
                      />
                      <Label htmlFor="keepSamePriceBook" className="cursor-pointer text-sm">
                        Do all clients' price books need to be kept the same?
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Address Fields for Selected Clients - in row with flex wrap */}
                {formData.clientIds.length > 0 && (
                  <div className="space-y-3">
                    <Label>Addresses</Label>
                    <div className="flex flex-wrap gap-3">
                      {formData.clientIds.map((clientId) => {
                        const client = clientList.find((c) => c.id === clientId);
                        const isEditing = editingClientId === clientId;
                        const currentAddress = formData.clientAddresses[clientId] || client?.address || '';

                        return (
                          <div key={clientId} className="space-y-2 p-3 border rounded-lg min-w-[300px] flex-1">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">{client?.name || 'Client'}</Label>
                              <div className="flex items-center gap-2">
                                <h2
                                  className="h-auto p-0 text-sm text-blue-600 hover:bg-transparent cursor-pointer"
                                  onClick={() => {
                                    const defaultAddress = client?.address || 'Karachi City, Pakistan';
                                    setFormData((prev) => ({
                                      ...prev,
                                      clientAddresses: { ...prev.clientAddresses, [clientId]: defaultAddress },
                                    }));
                                  }}
                                >
                                  Default Address
                                </h2>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setEditingClientId(isEditing ? null : clientId)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 relative">
                                <Input
                                  ref={(el) => {
                                    if (el) addressInputRefs.current[clientId] = el;
                                    else delete addressInputRefs.current[clientId];
                                  }}
                                  id={`address-input-${clientId}`}
                                  value={currentAddress}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      clientAddresses: { ...prev.clientAddresses, [clientId]: val },
                                    }));
                                  }}
                                  placeholder="Start typing an address..."
                                />

                                <style>{`
                              .pac-container {
                                      z-index: 999999 !important;
                                      pointer-events: auto !important;
                                  }
                                  .pac-item {
                                    padding: 8px 12px !important;
                                    cursor: pointer !important;
                                    border-top: 1px solid #e5e7eb !important;
                                    font-size: 14px !important;
                                  }
                                  .pac-item:first-child {
                                    border-top: none !important;
                                  }
                                  .pac-item:hover {
                                    background-color: #f3f4f6 !important;
                                  }
                                  .pac-item-selected {
                                    background-color: #e5e7eb !important;
                                  }
                                  .pac-icon {
                                    margin-right: 8px !important;
                                    cursor: pointer !important;
                                  }
                                  .pac-matched {
                                    font-weight: 500 !important;
                                  }
                                  .pac-item-query {
                                    cursor: pointer !important;
                                  }
                                  .pac-item-query span {
                                    cursor: pointer !important;
                                  }
                                  .pac-item * {
                                    cursor: pointer !important;
                                  }
                                `}</style>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleAddressUpdate(clientId, currentAddress)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        clientAddresses: {
                                          ...prev.clientAddresses,
                                          [clientId]: client?.address || 'Karachi City, Pakistan',
                                        },
                                      }));
                                      setEditingClientId(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                {currentAddress}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shift Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shift</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transport"
                  checked={formData.transport}
                  onCheckedChange={(checked) => handleCheckboxChange('transport', checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="transport" className="cursor-pointer">Transport</Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftType">Shift Type *</Label>
                <Select value={formData.shiftType} onValueChange={(value) => handleInputChange('shiftType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day Shift</SelectItem>
                    <SelectItem value="night">Night Shift</SelectItem>
                    <SelectItem value="evening">Evening Shift</SelectItem>
                  </SelectContent>
                </Select>
                {errors.shiftType && <p className="text-sm text-destructive">{errors.shiftType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowance">Allowance</Label>
                <Select value={formData.allowance} onValueChange={(value) => handleInputChange('allowance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Allowance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meal">Meal Allowance</SelectItem>
                    <SelectItem value="travel">Travel Allowance</SelectItem>
                    <SelectItem value="overnight">Overnight Allowance</SelectItem>
                    <SelectItem value="weekend">Weekend Allowance</SelectItem>
                    <SelectItem value="public-holiday">Public Holiday Allowance</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transport Section */}
          {formData.transport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transport</h3>
                <RadioGroup
                  value={formData.transportType}
                  onValueChange={(value) => handleInputChange('transportType', value)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="transport-self" />
                    <Label htmlFor="transport-self" className="cursor-pointer">Self</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver-allowance" id="transport-driver-allowance" />
                    <Label htmlFor="transport-driver-allowance" className="cursor-pointer">Driver allowance application</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formData.transportType === 'driver-allowance' && (
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Driver <span className="text-destructive">*</span></Label>
                    <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {carerList.map((carer) => (
                          <SelectItem key={carer.id} value={carer.id}>
                            {carer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* First Row */}
                <div className="space-y-2">
                  <Label htmlFor="fareType">Fare Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.fareType} onValueChange={(value) => handleInputChange('fareType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Fare Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-km">Price/KM</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km">KM <span className="text-destructive">*</span></Label>
                  <Input
                    id="km"
                    value={formData.km}
                    onChange={(e) => handleInputChange('km', e.target.value)}
                    placeholder="KM"
                  />
                </div>
                {/* Second Row */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) <span className="text-destructive">*</span></Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="$"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travelItemNumber">Travel Item Number <span className="text-destructive">*</span></Label>
                  <Select value={formData.travelItemNumber} onValueChange={(value) => handleInputChange('travelItemNumber', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item1">Item 1</SelectItem>
                      <SelectItem value="item2">Item 2</SelectItem>
                      <SelectItem value="item3">Item 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Time & Location Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Time & Location</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sleepover"
                  checked={formData.sleepover}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange('sleepover', checked as boolean);
                    // Uncheck Split Shift Rate when Sleepover is checked
                    if (checked) {
                      handleCheckboxChange('splitShiftRate', false);
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="sleepover" className="cursor-pointer">Sleepover</Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="startDateTime">Start DateTime *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "dd/MM/yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-[120px]"
                  />
                </div>
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDateTime">End DateTime *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "dd/MM/yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-[120px]"
                  />
                </div>
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat"
                  checked={formData.repeat}
                  onCheckedChange={(checked) => handleCheckboxChange('repeat', checked as boolean)}
                />
                <Label htmlFor="repeat" className="cursor-pointer">Repeat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="splitShiftRate"
                  checked={formData.splitShiftRate}
                  onCheckedChange={(checked) => handleCheckboxChange('splitShiftRate', checked as boolean)}
                  disabled={formData.sleepover}
                />
                <Label htmlFor="splitShiftRate" className={cn("cursor-pointer", formData.sleepover && "text-muted-foreground")}>
                  Split Shift Rate
                </Label>
              </div>
            </div>

            {/* Repeat/Recurrence Section */}
            {formData.repeat && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence">Recurrence <span className="text-destructive">*</span></Label>
                    <Select value={formData.recurrence} onValueChange={(value) => handleInputChange('recurrence', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occurs On - Weekly Days */}
                  {formData.recurrence === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Occurs On <span className="text-destructive">*</span></Label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day}`}
                              checked={formData.occursOn.includes(day)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('occursOn', [...formData.occursOn, day]);
                                } else {
                                  handleInputChange('occursOn', formData.occursOn.filter((d) => d !== day));
                                }
                              }}
                            />
                            <Label htmlFor={`day-${day}`} className="cursor-pointer text-sm">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Date Selector */}
                  {formData.recurrence === 'monthly' && (
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDate">Occurs On <span className="text-destructive">*</span></Label>
                      <Select value={formData.monthlyDate} onValueChange={(value) => handleInputChange('monthlyDate', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Date" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                            <SelectItem key={date} value={date.toString()}>
                              {date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repeatEvery">Repeat Every <span className="text-destructive">*</span> </Label>

                    <div className="flex items-center gap-2">
                      <Select value={formData.repeatEvery.toString()} onValueChange={(value) => handleInputChange('repeatEvery', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>Month</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repeatEndDate">End Date <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.repeatEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.repeatEndDate ? format(formData.repeatEndDate, "dd/MM/yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.repeatEndDate}
                          onSelect={(date) => handleInputChange('repeatEndDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Split Shift Rate Section */}
            {formData.splitShiftRate && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="splitShiftPriceBook">Price Book <span className="text-destructive">*</span></Label>
                  <Select value={formData.splitShiftPriceBook} onValueChange={(value) => handleInputChange('splitShiftPriceBook', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="splitShiftStartDateTime">Split Shift Start Date <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.splitShiftStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.splitShiftStartDate ? format(formData.splitShiftStartDate, "dd/MM/yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.splitShiftStartDate}
                          onSelect={(date) => handleInputChange('splitShiftStartDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={formData.splitShiftStartTime}
                      onChange={(e) => handleInputChange('splitShiftStartTime', e.target.value)}
                      className="w-[120px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="splitShiftEndDateTime">Split Shift End Date <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.splitShiftEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.splitShiftEndDate ? format(formData.splitShiftEndDate, "dd/MM/yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.splitShiftEndDate}
                          onSelect={(date) => handleInputChange('splitShiftEndDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={formData.splitShiftEndTime}
                      onChange={(e) => handleInputChange('splitShiftEndTime', e.target.value)}
                      className="w-[120px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeDuration">Time Duration <span className="text-destructive">*</span></Label>
                  <Input
                    id="timeDuration"
                    value={formData.timeDuration}
                    readOnly
                    className="bg-muted"
                    placeholder="00:00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Carer Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Carer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carerIds">Choose Carer *</Label>
                <MultiSelect
                  options={carerList.map((carer) => ({
                    label: carer.name,
                    value: carer.id,
                  }))}
                  selected={formData.carerIds}
                  onChange={(selected) => handleInputChange('carerIds', selected)}
                  placeholder="Choose Carer"
                />
                {errors.carerIds && <p className="text-sm text-destructive">{errors.carerIds}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyCarer">Notify Carer</Label>
                <Select value={formData.notifyCarer} onValueChange={(value) => handleInputChange('notifyCarer', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="payGroup">Choose Pay Group *</Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <Select value={formData.payGroup} onValueChange={(value) => handleInputChange('payGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group1">Group 1</SelectItem>
                    <SelectItem value="group2">Group 2</SelectItem>
                    <SelectItem value="group3">Group 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payGroup && <p className="text-sm text-destructive">{errors.payGroup}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="enableCarerLoginNotification">Enable Carer Login Notification</Label>
                <Select
                  value={formData.enableCarerLoginNotification}
                  onValueChange={(value) => handleInputChange('enableCarerLoginNotification', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Instructions"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Task Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Task</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Task Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Task Description</Label>
                <Input
                  id="taskDescription"
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Task Description"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="taskMandatory"
                    checked={newTask.mandatory}
                    onCheckedChange={(checked) => setNewTask((prev) => ({ ...prev, mandatory: checked as boolean }))}
                  />
                  <Label htmlFor="taskMandatory" className="cursor-pointer">Mandatory</Label>
                </div>
                <Button type="button" onClick={handleAddTask}>
                  Add
                </Button>
              </div>
            </div>

            {/* Task List */}
            {formData.tasks.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Added Tasks ({formData.tasks.length})</h4>
                {formData.tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <p className="font-medium">{task.title}</p>
                        {task.mandatory && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Mandatory</span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="ml-4"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEventForm;

