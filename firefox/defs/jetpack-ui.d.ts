declare module "sdk/ui" {
    export class ActionButton{
        constructor(params: ActionButtonParams)
    }
}

interface ActionButtonParams{
    id: string
    label: string
    icon: string
    onClick: (state: string) => void
}