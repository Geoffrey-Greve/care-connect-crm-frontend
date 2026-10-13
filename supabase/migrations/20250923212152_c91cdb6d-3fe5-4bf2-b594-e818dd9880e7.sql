-- Add missing NDIS support items for 2025-2026 schedule
INSERT INTO public.pricing_items (
  pricing_schedule_id, support_item_number, support_item_name, 
  registration_group_name, support_category_name, unit,
  price_act, price_nsw, price_qld, price_vic, price_remote, price_very_remote, quote_required
) VALUES
-- Get the 2025-2026 schedule ID
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_002_0107_1_1', 'Assistance With Self-Care Activities - Standard - Weekday Night', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 78.81, 78.81, 78.81, 78.81, 110.33, 118.22, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_003_0107_1_1', 'Assistance From Live-In Carer', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', NULL, NULL, NULL, NULL, NULL, NULL, true),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_010_0107_1_1', 'Assistance With Self-Care Activities - Night-Time Sleepover', 'Daily Personal Activities', 'Assistance with Daily Life', 'E', 297.60, 297.60, 297.60, 297.60, 416.64, 446.40, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_012_0107_1_1', 'Assistance With Self-Care Activities - Standard - Public Holiday', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 156.03, 156.03, 156.03, 156.03, 218.44, 234.05, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_013_0107_1_1', 'Assistance With Self-Care Activities - Standard - Saturday', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 98.83, 98.83, 98.83, 98.83, 138.36, 148.25, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_014_0107_1_1', 'Assistance With Self-Care Activities - Standard - Sunday', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 127.43, 127.43, 127.43, 127.43, 178.40, 191.15, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_015_0107_1_1', 'Assistance With Self-Care Activities - Standard - Weekday Evening', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 77.38, 77.38, 77.38, 77.38, 108.33, 116.07, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_016_0104_1_1', 'Specialised Home Based Assistance For A Child', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 59.06, 59.06, 59.06, 59.06, 82.68, 88.59, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_017_0107_1_1', 'On-Call Overnight Monitoring-Off Site or Onsite (Includes 1 hour of assistance)', 'Daily Personal Activities', 'Assistance with Daily Life', 'E', NULL, NULL, NULL, NULL, NULL, NULL, true),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_021_0120_1_1', 'Linen Service', 'Household Tasks', 'Assistance with Daily Life', 'E', NULL, NULL, NULL, NULL, NULL, NULL, true),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_023_0120_1_1', 'Assistance with the cost of the preparation and delivery of meals', 'Household Tasks', 'Assistance with Daily Life', 'E', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, false),

-- High Intensity Support items
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_400_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Weekday Daytime', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 75.98, 75.98, 75.98, 75.98, 106.37, 113.97, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_401_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Weekday Evening', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 83.72, 83.72, 83.72, 83.72, 117.21, 125.58, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_402_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Saturday', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 106.93, 106.93, 106.93, 106.93, 149.70, 160.40, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_403_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Sunday', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 137.87, 137.87, 137.87, 137.87, 193.02, 206.81, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_404_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Public Holiday', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 168.81, 168.81, 168.81, 168.81, 236.33, 253.22, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '01_405_0104_1_1', 'Assistance With Self-Care Activities - High Intensity - Weekday Night', 'High Intensity Daily Personal Activities', 'Assistance with Daily Life', 'H', 85.27, 85.27, 85.27, 85.27, 119.38, 127.91, false),

-- Community Participation Support items  
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '02_003_0125_2_2', 'Individual Skill Development', 'Community Access', 'Capacity Building', 'H', 78.81, 78.81, 78.81, 78.81, 110.33, 118.22, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '02_004_0134_2_2', 'Therapeutic Supports', 'Therapeutic Supports', 'Capacity Building', 'H', 193.99, 193.99, 193.99, 193.99, 271.59, 291.99, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '02_005_0125_2_2', 'Group Activities', 'Community Access', 'Capacity Building', 'H', 8.39, 8.39, 8.39, 8.39, 11.75, 12.59, false),

-- Capital Support items
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '03_016_0136_6_3', 'Home Modifications', 'Assistive Technology', 'Capital', 'EA', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '03_017_0136_6_3', 'Vehicle Modifications', 'Assistive Technology', 'Capital', 'EA', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '03_018_0136_6_3', 'Assistive Products For Household Tasks', 'Assistive Technology', 'Capital', 'EA', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, false),
((SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'), '03_019_0136_6_3', 'Assistive Products For Personal Care And Safety', 'Assistive Technology', 'Capital', 'EA', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, false)

ON CONFLICT (pricing_schedule_id, support_item_number) DO NOTHING;