export interface Events {
	scroll? (sender: any, event: any): boolean
	focus? (sender: any, event: any): boolean
	mouseover? (sender: any, event: MouseEvent): boolean
	mouseleave? (sender: any, event: MouseEvent): boolean
	mouseup? (sender: any, event: MouseEvent): boolean
	mousedown? (sender: any, event: MouseEvent): boolean
	mousemove? (sender: any, event: MouseEvent): boolean
}
