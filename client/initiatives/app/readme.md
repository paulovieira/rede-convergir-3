The html from the server has 2 regions: mn-r-map-1 and mn-r-map-2 (not visible at the beggining). THis is the starting point.

## MapIV

The outside view is MapIV. We show it in mn-r-map-1.

The template of this view is just one div:

<div class="mn-leaflet-map"></div>

This will be the container for the leaflet map (we pass the HTMLElement to leaflet)

## MenuLV

After the map has been created we add a control for the menu (L.Control.BackboneView). This is a dummy control whose only purpose is to get the element of a LayoutView, which is where the menu will be. Leaflet will then place this element in the appropriate position and with the right classes. Note that the "leaflet-control" class will be added to the main element of the view.

The MenuLV has just one region: bodyRegion. To open the menu we show a view here; to close it, we reset the region;

## MenuBodyIV

This is the view relative to the actual menu