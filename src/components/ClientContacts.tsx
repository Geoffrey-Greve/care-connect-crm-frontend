import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Edit, User, Phone, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

// Mock contacts data
const mockContacts = [
  {
    id: "CONT-001",
    fullName: "John Smith",
    contactNumber: "+61 400 111 222",
    email: "john.smith@email.com",
    relation: "Father",
  },
  {
    id: "CONT-002",
    fullName: "Mary Smith",
    contactNumber: "+61 400 111 333",
    email: "mary.smith@email.com",
    relation: "Mother",
  },
  {
    id: "CONT-003",
    fullName: "David Johnson",
    contactNumber: "+61 400 111 444",
    email: "david.johnson@email.com",
    relation: "Brother",
  },
  {
    id: "CONT-004",
    fullName: "Sarah Williams",
    contactNumber: "+61 400 111 555",
    email: "sarah.williams@email.com",
    relation: "Sister",
  },
];

type ContactSortField = 'fullName' | 'contactNumber' | 'email' | 'relation';
type ContactSortDirection = 'asc' | 'desc' | null;

interface ClientContactsProps {
  clientName?: string;
}

const ClientContacts: React.FC<ClientContactsProps> = ({ clientName }) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState(mockContacts);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isUpdateContactOpen, setIsUpdateContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [contactSortField, setContactSortField] = useState<ContactSortField | null>(null);
  const [contactSortDirection, setContactSortDirection] = useState<ContactSortDirection>(null);
  const [contactCurrentPage, setContactCurrentPage] = useState(1);
  const [contactEntriesPerPage, setContactEntriesPerPage] = useState(10);
  const [contactForm, setContactForm] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNumber: "",
    phoneNumber: "",
    relation: "",
    companyName: "",
    companyNumber: "",
    purchaseOrder: "",
    referenceNumber: "",
    customField: "",
    primaryContact: "No",
    billingContact: "No",
  });

  const handleAddContact = () => {
    setContactForm({
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      contactNumber: "",
      phoneNumber: "",
      relation: "",
      companyName: "",
      companyNumber: "",
      purchaseOrder: "",
      referenceNumber: "",
      customField: "",
      primaryContact: "No",
      billingContact: "No",
    });
    setIsAddContactOpen(true);
  };

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    toast({
      title: "View Contact",
      description: `Viewing details for ${contact.fullName}`,
    });
  };

  const handleUpdateContact = (contact: any) => {
    setSelectedContact(contact);
    // Split fullName into firstName and lastName if possible
    const nameParts = contact.fullName?.split(' ') || [];
    setContactForm({
      salutation: contact.salutation || "",
      firstName: nameParts[0] || "",
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : "",
      email: contact.email || "",
      address: contact.address || "",
      contactNumber: contact.contactNumber || "",
      phoneNumber: contact.phoneNumber || "",
      relation: contact.relation || "",
      companyName: contact.companyName || "",
      companyNumber: contact.companyNumber || "",
      purchaseOrder: contact.purchaseOrder || "",
      referenceNumber: contact.referenceNumber || "",
      customField: contact.customField || "",
      primaryContact: contact.primaryContact || "No",
      billingContact: contact.billingContact || "No",
    });
    setIsUpdateContactOpen(true);
  };

  const handleContactSort = (field: ContactSortField) => {
    if (contactSortField === field) {
      if (contactSortDirection === 'asc') {
        setContactSortDirection('desc');
      } else if (contactSortDirection === 'desc') {
        setContactSortField(null);
        setContactSortDirection(null);
      }
    } else {
      setContactSortField(field);
      setContactSortDirection('asc');
    }
  };

  const getContactSortIcon = (field: ContactSortField) => {
    if (contactSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return contactSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleContactSubmit = () => {
    // Validation for required fields
    if (!contactForm.salutation || !contactForm.firstName || !contactForm.lastName || 
        !contactForm.email || !contactForm.address || !contactForm.contactNumber || !contactForm.relation) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (basic check)
    if (contactForm.contactNumber.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid contact number",
        variant: "destructive",
      });
      return;
    }

    const fullName = `${contactForm.firstName} ${contactForm.lastName}`.trim();

    if (isUpdateContactOpen && selectedContact) {
      // Update existing contact
      setContacts(contacts.map(c =>
        c.id === selectedContact.id
          ? {
              ...c,
              fullName: fullName,
              salutation: contactForm.salutation,
              firstName: contactForm.firstName,
              lastName: contactForm.lastName,
              contactNumber: contactForm.contactNumber,
              phoneNumber: contactForm.phoneNumber,
              email: contactForm.email,
              address: contactForm.address,
              relation: contactForm.relation,
              companyName: contactForm.companyName,
              companyNumber: contactForm.companyNumber,
              purchaseOrder: contactForm.purchaseOrder,
              referenceNumber: contactForm.referenceNumber,
              customField: contactForm.customField,
              primaryContact: contactForm.primaryContact,
              billingContact: contactForm.billingContact,
            }
          : c
      ));
      toast({
        title: "Contact Updated",
        description: "Contact details have been updated successfully.",
      });
    } else {
      // Add new contact
      const newContact = {
        id: `CONT-${Date.now()}`,
        fullName: fullName,
        salutation: contactForm.salutation,
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        contactNumber: contactForm.contactNumber,
        phoneNumber: contactForm.phoneNumber,
        email: contactForm.email,
        address: contactForm.address,
        relation: contactForm.relation,
        companyName: contactForm.companyName,
        companyNumber: contactForm.companyNumber,
        purchaseOrder: contactForm.purchaseOrder,
        referenceNumber: contactForm.referenceNumber,
        customField: contactForm.customField,
        primaryContact: contactForm.primaryContact,
        billingContact: contactForm.billingContact,
      };
      setContacts([...contacts, newContact]);
      toast({
        title: "Contact Added",
        description: "New contact has been added successfully.",
      });
    }

    // Reset form
    setContactForm({
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      contactNumber: "",
      phoneNumber: "",
      relation: "",
      companyName: "",
      companyNumber: "",
      purchaseOrder: "",
      referenceNumber: "",
      customField: "",
      primaryContact: "No",
      billingContact: "No",
    });
    setIsAddContactOpen(false);
    setIsUpdateContactOpen(false);
    setSelectedContact(null);
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Apply search filter
    if (contactSearch) {
      const search = contactSearch.toLowerCase();
      result = result.filter(contact =>
        contact.fullName.toLowerCase().includes(search) ||
        contact.contactNumber.includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.relation.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (contactSortField && contactSortDirection) {
      result.sort((a, b) => {
        let aValue: string;
        let bValue: string;

        switch (contactSortField) {
          case 'fullName':
            aValue = a.fullName;
            bValue = b.fullName;
            break;
          case 'contactNumber':
            aValue = a.contactNumber;
            bValue = b.contactNumber;
            break;
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'relation':
            aValue = a.relation;
            bValue = b.relation;
            break;
          default:
            return 0;
        }

        return contactSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [contacts, contactSearch, contactSortField, contactSortDirection]);

  // Contact pagination
  const contactTotalPages = Math.ceil(filteredAndSortedContacts.length / contactEntriesPerPage);
  const contactStartIndex = (contactCurrentPage - 1) * contactEntriesPerPage;
  const contactEndIndex = contactStartIndex + contactEntriesPerPage;
  const paginatedContacts = filteredAndSortedContacts.slice(contactStartIndex, contactEndIndex);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Additional Contacts</CardTitle>
            <Button onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    setContactCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={contactEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setContactEntriesPerPage(Number(value));
                    setContactCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleContactSort('fullName')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Full Name
                        {getContactSortIcon('fullName')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleContactSort('contactNumber')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Contact Number
                        {getContactSortIcon('contactNumber')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleContactSort('email')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Email
                        {getContactSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleContactSort('relation')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Relation
                        {getContactSortIcon('relation')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[150px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContacts.map((contact, index) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {contact.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{contact.contactNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{contact.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{contact.relation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateContact(contact)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {contactStartIndex + 1} to {Math.min(contactEndIndex, filteredAndSortedContacts.length)} of {filteredAndSortedContacts.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContactCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={contactCurrentPage === 1 || contactTotalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: contactTotalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === contactTotalPages ||
                      (page >= contactCurrentPage - 1 && page <= contactCurrentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={contactCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContactCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === contactCurrentPage - 2 || page === contactCurrentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContactCurrentPage(prev => Math.min(contactTotalPages, prev + 1))}
                  disabled={contactCurrentPage === contactTotalPages || contactTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Sheet */}
      <Sheet open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Contact Form</SheetTitle>
            <SheetDescription>
              Add a new contact for this client. Fill in all required fields marked with *.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-full-name">Full Name <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={contactForm.salutation}
                      onValueChange={(value) => setContactForm({ ...contactForm, salutation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Salutation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                      placeholder="First Name"
                      className="col-span-2"
                    />
                  </div>
                  <Input
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-address">Address <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="contact-address"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-number">Contact <span className="text-destructive">*</span></Label>
                  <Input
                    id="contact-number"
                    value={contactForm.contactNumber}
                    onChange={(e) => setContactForm({ ...contactForm, contactNumber: e.target.value })}
                    placeholder="Contact Number"
                  />
                  <Input
                    value={contactForm.phoneNumber}
                    onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                    placeholder="Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-relation">Relation <span className="text-destructive">*</span></Label>
                  <Input
                    id="contact-relation"
                    value={contactForm.relation}
                    onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                    placeholder="Enter relation"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-company-name">Company Name</Label>
                  <Input
                    id="contact-company-name"
                    value={contactForm.companyName}
                    onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-company-number">Company Number</Label>
                  <Input
                    id="contact-company-number"
                    value={contactForm.companyNumber}
                    onChange={(e) => setContactForm({ ...contactForm, companyNumber: e.target.value })}
                    placeholder="Enter company number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-purchase-order">Purchase Order</Label>
                  <Input
                    id="contact-purchase-order"
                    value={contactForm.purchaseOrder}
                    onChange={(e) => setContactForm({ ...contactForm, purchaseOrder: e.target.value })}
                    placeholder="Enter purchase order"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-reference-number">Reference Number</Label>
                  <Input
                    id="contact-reference-number"
                    value={contactForm.referenceNumber}
                    onChange={(e) => setContactForm({ ...contactForm, referenceNumber: e.target.value })}
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-custom-field">Custom Field</Label>
                  <Input
                    id="contact-custom-field"
                    value={contactForm.customField}
                    onChange={(e) => setContactForm({ ...contactForm, customField: e.target.value })}
                    placeholder="Enter custom field"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact</Label>
                  <RadioGroup
                    value={contactForm.primaryContact}
                    onValueChange={(value) => setContactForm({ ...contactForm, primaryContact: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="primary-no" />
                      <Label htmlFor="primary-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="primary-yes" />
                      <Label htmlFor="primary-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Billing Contact</Label>
                  <RadioGroup
                    value={contactForm.billingContact}
                    onValueChange={(value) => setContactForm({ ...contactForm, billingContact: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="billing-no" />
                      <Label htmlFor="billing-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="billing-yes" />
                      <Label htmlFor="billing-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Close
            </Button>
            <Button onClick={handleContactSubmit}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Contact Sheet */}
      <Sheet open={isUpdateContactOpen} onOpenChange={setIsUpdateContactOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Contact Form</SheetTitle>
            <SheetDescription>
              Update contact information. Fill in all required fields marked with *.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-contact-full-name">Full Name <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={contactForm.salutation}
                      onValueChange={(value) => setContactForm({ ...contactForm, salutation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Salutation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                      placeholder="First Name"
                      className="col-span-2"
                    />
                  </div>
                  <Input
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-address">Address <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="update-contact-address"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-number">Contact <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-contact-number"
                    value={contactForm.contactNumber}
                    onChange={(e) => setContactForm({ ...contactForm, contactNumber: e.target.value })}
                    placeholder="Contact Number"
                  />
                  <Input
                    value={contactForm.phoneNumber}
                    onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                    placeholder="Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-relation">Relation <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-contact-relation"
                    value={contactForm.relation}
                    onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                    placeholder="Enter relation"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-contact-company-name">Company Name</Label>
                  <Input
                    id="update-contact-company-name"
                    value={contactForm.companyName}
                    onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-company-number">Company Number</Label>
                  <Input
                    id="update-contact-company-number"
                    value={contactForm.companyNumber}
                    onChange={(e) => setContactForm({ ...contactForm, companyNumber: e.target.value })}
                    placeholder="Enter company number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-purchase-order">Purchase Order</Label>
                  <Input
                    id="update-contact-purchase-order"
                    value={contactForm.purchaseOrder}
                    onChange={(e) => setContactForm({ ...contactForm, purchaseOrder: e.target.value })}
                    placeholder="Enter purchase order"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-reference-number">Reference Number</Label>
                  <Input
                    id="update-contact-reference-number"
                    value={contactForm.referenceNumber}
                    onChange={(e) => setContactForm({ ...contactForm, referenceNumber: e.target.value })}
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-contact-custom-field">Custom Field</Label>
                  <Input
                    id="update-contact-custom-field"
                    value={contactForm.customField}
                    onChange={(e) => setContactForm({ ...contactForm, customField: e.target.value })}
                    placeholder="Enter custom field"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact</Label>
                  <RadioGroup
                    value={contactForm.primaryContact}
                    onValueChange={(value) => setContactForm({ ...contactForm, primaryContact: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="update-primary-no" />
                      <Label htmlFor="update-primary-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="update-primary-yes" />
                      <Label htmlFor="update-primary-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Billing Contact</Label>
                  <RadioGroup
                    value={contactForm.billingContact}
                    onValueChange={(value) => setContactForm({ ...contactForm, billingContact: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="update-billing-no" />
                      <Label htmlFor="update-billing-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="update-billing-yes" />
                      <Label htmlFor="update-billing-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateContactOpen(false)}>
              Close
            </Button>
            <Button onClick={handleContactSubmit}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClientContacts;

