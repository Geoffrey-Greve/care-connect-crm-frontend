import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ErrorDialog } from "@/components/ErrorDialog";
import { useNavigate } from "react-router-dom";
import { useGetClientTypesQuery } from "@/redux/api/clientTypeApi";
import { useGetLanguagesQuery } from "@/redux/api/languageApi";
import { useCreateClientMutation } from "@/redux/api/clientsApi";
import { CreateClientRequest } from "@/types/models";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const clientFormSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().optional(),
  clientType: z.number({
    required_error: "Client type is required",
  }),
  ndisNumber: z.string().optional(),
  primaryPhoneNumber: z.string().min(1, "Primary phone number is required"),
  email: z.string().email("Valid email is required"),
  secondaryPhoneNumber: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  maritalStatus: z.string().min(1, "Marital status is required"),
  language: z.number().optional(),
  address: z.string().optional(),
  profileImg: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const salutations = ["Mr", "Mrs", "Ms", "Dr", "Prof"];
const genders = ["male", "female", "other"];
const maritalStatuses = ["single", "married", "divorced", "widowed"];
const nationalities = [
  "Australian", "British", "Canadian", "Chinese", "Indian", "American", 
  "Japanese", "Korean", "Filipino", "Vietnamese", "Thai", "Malaysian",
  "Indonesian", "New Zealander", "Irish", "German", "French", "Italian",
  "Spanish", "Greek", "Lebanese", "Turkish", "Pakistani", "Bangladeshi",
  "Sri Lankan", "Nepalese", "Other"
];
const religions = [
  "Christianity", "Islam", "Hinduism", "Buddhism", "Sikhism", "Judaism",
  "No Religion", "Atheist", "Agnostic", "Other", "Prefer not to say"
];

export default function ClientForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch client types and languages from API
  const { data: clientTypesData, isLoading: isLoadingClientTypes } = useGetClientTypesQuery({ limit: 100 });
  const { data: languagesData, isLoading: isLoadingLanguages } = useGetLanguagesQuery({ limit: 100 });
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();

  const clientTypes = clientTypesData?.data?.filter(ct => ct.status) || [];
  const languages = languagesData?.data?.filter(lang => lang.status) || [];

  // Log for debugging
  console.log("Client Types:", clientTypes);
  console.log("Languages:", languages);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      primaryPhoneNumber: "",
      email: "",
      gender: "",
      maritalStatus: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue("profileImg", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ClientFormValues) {
    try {
      const payload = {
        salutation: values.salutation || undefined,
        first_name: values.firstName,
        last_name: values.lastName,
        display_name: values.displayName || undefined,
        email: values.email,
        primary_phone_number: values.primaryPhoneNumber,
        secondary_phone_number: values.secondaryPhoneNumber || undefined,
        client_type: values.clientType, // ID (number)
        ndis_number: values.ndisNumber || undefined,
        nationality: values.nationality || undefined,
        religion: values.religion || undefined,
        gender: values.gender,
        date_of_birth: values.dateOfBirth ? format(values.dateOfBirth, "yyyy-MM-dd") : undefined,
        marital_status: values.maritalStatus,
        address: values.address || undefined,
        language: values.language || undefined, // ID (number)
        profile_img: values.profileImg || undefined,
      };
    
      console.log("Submitting Client Payload:", payload);

      const response = await createClient(payload as CreateClientRequest).unwrap();
    
      if (response.status) {
    toast({
          title: "Success",
          description: response.message || "Client created successfully",
        });
        navigate("/clients");
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      const errorMsg = error?.data?.message || "Failed to create client";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  }

  function onCancel() {
    navigate("/clients");
    navigate("/clients");
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Client Form</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-14">
            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/clients")}>
              Manage Client
            </span>
            <span>&gt;</span>
            <span>Client Form</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-4 md:p-6">
            {/* Loading State */}
            {(isLoadingClientTypes || isLoadingLanguages) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                Loading form data...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Salutation */}
                  <FormField
                    control={form.control}
                    name="salutation"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Salutation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {salutations.map((salutation) => (
                              <SelectItem key={salutation} value={salutation}>
                                {salutation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Client Type */}
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Type *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Client Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClientTypes ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : clientTypes.length > 0 ? (
                          clientTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>No data available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                      <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* NDIS Number */}
                  <FormField
                    control={form.control}
                name="ndisNumber"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>NDIS Number</FormLabel>
                        <FormControl>
                      <Input placeholder="NDIS Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                      <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              {/* Primary Phone Number */}
                  <FormField
                    control={form.control}
                name="primaryPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Primary Phone Number *</FormLabel>
                        <FormControl>
                      <Input placeholder="Primary Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Display Name */}
                  <FormField
                    control={form.control}
                name="displayName"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                      <Input placeholder="Display Name" {...field} />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              {/* Email */}
                  <FormField
                    control={form.control}
                name="email"
                    render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                        <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Marital Status */}
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                          <SelectValue placeholder="Select Marital Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Secondary Phone Number */}
                  <FormField
                    control={form.control}
                name="secondaryPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Secondary Phone Number</FormLabel>
                        <FormControl>
                      <Input placeholder="Secondary Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Date of Birth */}
                  <FormField
                    control={form.control}
                name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                              format(field.value, "dd-MM-yyyy")
                                ) : (
                              <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                          className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Nationality */}
                  <FormField
                    control={form.control}
                name="nationality"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Nationality" />
                        </SelectTrigger>
                        </FormControl>
                      <SelectContent>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>
                            {nationality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Gender */}
                  <FormField
                    control={form.control}
                name="gender"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        </FormControl>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Religion */}
                  <FormField
                    control={form.control}
                name="religion"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Religion</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                          <SelectValue placeholder="Select Religion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                        {religions.map((religion) => (
                          <SelectItem key={religion} value={religion}>
                            {religion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              {/* Language */}
                  <FormField
                    control={form.control}
                name="language"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      defaultValue={field.value?.toString()}
                    >
                        <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                        </FormControl>
                      <SelectContent>
                        {isLoadingLanguages ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : languages.length > 0 ? (
                          languages.map((language) => (
                            <SelectItem key={language.id} value={language.id.toString()}>
                              {language.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>No data available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
              {/* Upload Image */}
                  <FormField
                    control={form.control}
                name="profileImg"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                      </div>
                        </FormControl>
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover border"
                        />
                      </div>
                    )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              {/* Address - Full Width */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Saving..." : "Submit"}
              </Button>
            </div>

            {/* Loading Overlay */}
            {isCreating && !isErrorDialogOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-700 font-medium">Creating Client...</p>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

