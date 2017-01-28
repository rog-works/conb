export interface Events {
	scroll? (self: any, event: any): boolean
	mouseover? (self: any, event: MouseEvent): boolean
	mouseleave? (self: any, event: MouseEvent): boolean
	mouseup? (self: any, event: MouseEvent): boolean
	mousedown? (self: any, event: MouseEvent): boolean
	mousemove? (self: any, event: MouseEvent): boolean
}
