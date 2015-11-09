popup: also shwo the text (with scroll)
DONE on mouseover over the icon, show the label 
on mouseover over the icon, scroll the list to the correct position
DONE on mouseover over the list, show the label


interactions:

on the marker:
    -mouseover: 
        -scale(1.1) in the transform
        -show the label
        -increase zindex of the marker and the label (to make sure both are above the markers nearby)

    -mouseout
        -remove scale from the transform
        -remove the label
        -(don't do anything on the zindex, it will be reset automatically on zoom/panby)




on the list

    -click
        -show the popup
        -remove the label (which is being show because before the click we had to mouseover)
    -mouseenter
        -scale(1.1) in the transform
        -show the label
        -increase zindex of the marker and the label (to make sure both are above the markers nearby)
    -mouseleave
        -remove scale from the transform
        -remove the label
        -(don't do anything on the zindex, it will be reset automatically on zoom/panby)


