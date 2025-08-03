import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">$1,250.00</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription>New Customers</CardDescription>
              <CardTitle className="text-2xl">1,234</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingDown className="h-3 w-3" />
              -20%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription>Active Accounts</CardDescription>
              <CardTitle className="text-2xl">45,678</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription>Growth Rate</CardDescription>
              <CardTitle className="text-2xl">4.5%</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrendingUp className="h-3 w-3" />
              +4.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
