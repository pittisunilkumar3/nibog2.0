"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CitySelectorProps {
  onCityChange?: (cityId: number) => void;
}

// City type definition based on API response
interface City {
  id: number;
  city_name: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CitySelector({ onCityChange }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities from API
  useEffect(() => {
    let isMounted = true;

    const fetchCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the direct API endpoint since we're now allowing it in the middleware
        const apiUrl = 'https://ai.nibog.in/webhook/v1/nibog/city/get-all';
        console.log('Fetching cities from direct API endpoint...');

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log('API Response Status:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('Raw response (first 200 chars):', responseText.substring(0, 200));

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse the JSON response
        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);

        if (!isMounted) return;

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected an array of cities');
        }

        // Process the cities data
        const activeCities = data.filter((city: City) => city.is_active);
        console.log(`Found ${activeCities.length} active cities`);
        
        if (activeCities.length === 0) {
          console.warn('No active cities found in the response');
        }

        setCities(activeCities);
        
        // If there's only one city, select it by default
        if (activeCities.length === 1 && onCityChange) {
          setValue(activeCities[0].id.toString());
          onCityChange(activeCities[0].id);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Error fetching cities:', err);
        setError(err.message || 'Failed to load cities');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCities();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [onCityChange]);

  // When value changes, find the city and call onCityChange with its ID
  useEffect(() => {
    if (value && onCityChange) {
      const selectedCity = cities.find(city => city.id.toString() === value)
      if (selectedCity) {
        onCityChange(selectedCity.id)
      }
    }
  }, [value, onCityChange, cities])

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading cities...
              </div>
            ) : error ? (
              <div className="flex items-center text-destructive">
                <MapPin className="mr-2 h-4 w-4" />
                Error loading cities
              </div>
            ) : value ? (
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                {cities.find((city) => city.id.toString() === value)?.city_name}
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                Select a city...
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-[100]" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search city..." />
            <CommandList>
              <CommandEmpty>No city found.</CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading cities...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-sm text-destructive">
                  {error}
                </div>
              ) : (
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.id.toString()}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === city.id.toString() ? "opacity-100" : "opacity-0")} />
                      {city.city_name}
                      <span className="ml-2 text-xs text-muted-foreground">{city.state}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
