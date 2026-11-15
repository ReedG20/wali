import type { ComponentType } from "react"
import { notification } from "./notification"
import { task } from "./task"
import { chatPhone, chatWeb } from "./chat"
import { endCard, listening, titleCard } from "./brand"
import type { Comp } from "./types"
import { GradesPage } from "../pages/Grades"
import { BrandBoard } from "../pages/BrandBoard"

export const COMPS: Comp[] = [notification, task, listening, chatPhone, chatWeb, endCard, titleCard]

export const PAGES: { id: string; name: string; Component: ComponentType }[] = [
  { id: "grades", name: "Color grades", Component: GradesPage },
  { id: "brand", name: "Brand board", Component: BrandBoard },
]
