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

import { getAllCities, City } from "@/services/cityService"

export default function CitySelector({ onCityChange }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities from API
  useEffect(() => {
    let isMounted = true;

    const fetchCitiesData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching cities via cityService...');
        const activeCities = await getAllCities();

        if (!isMounted) return;

        console.log(`Found ${activeCities.length} cities`);

        if (activeCities.length === 0) {
          console.warn('No cities found');
        }

        // The service already returns the cities, we can filter for active ones here if needed
        // but the service should probably handle that or it returns all
        const filteredCities = activeCities.filter(city => city.is_active === 1 || city.is_active === true);
        setCities(filteredCities);

        // If there's only one city, select it by default
        if (filteredCities.length === 1 && onCityChange) {
          setValue(filteredCities[0].id!.toString());
          onCityChange(filteredCities[0].id!);
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

    fetchCitiesData();

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
