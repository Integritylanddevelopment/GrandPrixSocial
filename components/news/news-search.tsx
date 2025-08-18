"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface NewsSearchProps {
  onSearch: (query: string, filters: { category?: string; priority?: string }) => void
  categories: string[]
  priorities: string[]
}

export function NewsSearch({ onSearch, categories, priorities }: NewsSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [activeFilters, setActiveFilters] = useState<Array<{ type: string; value: string }>>([])

  const handleSearch = () => {
    const filters: { category?: string; priority?: string } = {}
    if (selectedCategory && selectedCategory !== "all") filters.category = selectedCategory
    if (selectedPriority && selectedPriority !== "all") filters.priority = selectedPriority

    onSearch(query, filters)

    // Update active filters display
    const newFilters = []
    if (selectedCategory && selectedCategory !== "all") newFilters.push({ type: "category", value: selectedCategory })
    if (selectedPriority && selectedPriority !== "all") newFilters.push({ type: "priority", value: selectedPriority })
    setActiveFilters(newFilters)
  }

  const removeFilter = (filterToRemove: { type: string; value: string }) => {
    if (filterToRemove.type === "category") {
      setSelectedCategory("all")
    } else if (filterToRemove.type === "priority") {
      setSelectedPriority("all")
    }

    const newFilters = activeFilters.filter((f) => f !== filterToRemove)
    setActiveFilters(newFilters)

    // Re-run search without this filter
    const filters: { category?: string; priority?: string } = {}
    newFilters.forEach((filter) => {
      if (filter.type === "category") filters.category = filter.value
      if (filter.type === "priority") filters.priority = filter.value
    })
    onSearch(query, filters)
  }

  const clearAllFilters = () => {
    setQuery("")
    setSelectedCategory("all")
    setSelectedPriority("all")
    setActiveFilters([])
    onSearch("", {})
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search F1 news, drivers, teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all duration-200"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Categories
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category} className="text-white">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">
              All Priorities
            </SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority} className="text-white">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button variant="outline" onClick={clearAllFilters} className="border-gray-600 text-gray-400 bg-transparent">
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="bg-red-600/20 text-red-400 border-red-500/50">
              {filter.type}: {filter.value}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-red-400 hover:text-red-300"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
