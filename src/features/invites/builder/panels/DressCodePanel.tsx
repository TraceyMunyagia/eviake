import { ColourListField, TextAreaField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'

export function DressCodePanel() {
  return (
    <div className="space-y-4">
      <TextField path={P.dressTitle} label="Dress code" placeholder="e.g. Black tie, Smart casual" />
      <TextAreaField path={P.dressBody} label="Guidance" rows={3} />
      <ColourListField path={P.dressColours} label="Suggested colours" hint="Up to 8. Inspiration photos are added under Design & media." />
    </div>
  )
}
