/**
 * draw.js : Not optimally desgiend, but to assist in learning, a wrapper 
 * of the CreateJS Graphic API to reduce boiler-plate and that also supports
 * calculation of width and height properties on shapes.
 * 
 * For CreateJS Graphic API not wrapped by this version, use the Graphic API directly.
 * See: http://www.createjs.com/Docs/EaselJS/classes/Graphics.html
 * 
 * Version: 1.2
 * 
 * Dependencies: easeljs-0.7.1
 */
(function (window) {
    const TYPE_RECTANGULAR  = 'retangular';
    const TYPE_CIRCULAR     = 'circular';
    const TYPE_TRIANGULAR   = 'triangular';
    const TYPE_IRREGULAR    = 'irregular';
    const TYPE_LINEAR       = 'linear';
    
    window.opspark = window.opspark || {};
    
    function sortNumbersAscending(a, b) { return a - b; }
    
    function getStartPointX(object) {
        switch (object.type) {
            case TYPE_CIRCULAR:
                return -(object.radius) + object.xOffset;
            default:
                return object.xOffset;
        }
    }
    
    function getStartPointY(object) {
        switch (object.type) {
            case TYPE_CIRCULAR:
                return -(object.radius) + object.yOffset;
            default:
                return object.yOffset;
        }
    }
    
    function getEndPointX(object) {
        switch (object.type) {
            case TYPE_CIRCULAR:
                return object.radius + object.xOffset;
            default:
                return object.xOffset + object.width;
        }
    }
    
    function getEndPointY(object) {
        switch (object.type) {
            case TYPE_CIRCULAR:
                return object.radius + object.yOffset;
            default:
                return object.yOffset + object.height;
        }
    }
    
    function buildDimensions(type, width, height, xOffset, yOffset, radius) {
        var dimensions = {
            type: type,
            width: width,
            height: height,
            xOffset: (xOffset) ? xOffset : 0,
        	yOffset: (yOffset) ? yOffset : 0
        };
        if (radius) { dimensions.radius = radius; }
        return dimensions;
    }
    
    var draw = {
        setDimensionsOn: function (shape, dimensions) {
            /*
             * If the shape already has dimensions, it means we're adding graphics to it, making it composite.
             */
            if (shape.dimensions) {
                // first figure out the points of extremity //
                var xStartPoint = [getStartPointX(shape), getStartPointX(dimensions)].sort(sortNumbersAscending)[0];
                var xEndPoint = [getEndPointX(shape), getEndPointX(dimensions)].sort(sortNumbersAscending)[1];
                
                var yStartPoint = [getStartPointY(shape), getStartPointY(dimensions)].sort(sortNumbersAscending)[0];
                var yEndPoint = [getEndPointY(shape), getEndPointY(dimensions)].sort(sortNumbersAscending)[1];
                
                var xs = 0;
                var ys = 0;
                
                /*
                 * for the width calculation, we don't care about the y value 
                 * of the points of comparison, and vice versa for height.
                 */
                xs = xEndPoint - xStartPoint;
                xs = xs * xs;
                dimensions.width = Math.sqrt(xs + ys);
                
                xs = 0;
                ys = yEndPoint - yStartPoint;
                ys = ys * ys;
                dimensions.height = Math.sqrt(xs + ys);
                
                dimensions.xOffset = xStartPoint;
                dimensions.yOffset = yStartPoint;
                
                /*
                 * If we're compounding graphics, the shape is now irregular.
                 */
                dimensions.type = TYPE_IRREGULAR;
                
                /*
                 * We don't need to track radius on irregular objects.
                 */
                if (shape.radius) { delete shape.radius; }
            }
            
            shape.setBounds(dimensions.xOffset, dimensions.yOffset, dimensions.width, dimensions.height);
            shape.dimensions = dimensions;
            shape.width = dimensions.width;
            shape.height = dimensions.height;
            shape.xOffset = dimensions.xOffset;
            shape.yOffset = dimensions.yOffset;
            shape.type = dimensions.type;

            // debug //
            // console.log(shape.width);
            // console.log(shape.height);
            
            return shape;
        },
        
        line: function (x, y, strokeColor, strokeStyle, xOffset, yOffset, onShape) {
            var dimensions = buildDimensions(TYPE_LINEAR, x, y, xOffset, yOffset);
            
            var shape = (onShape) ? onShape : new createjs.Shape();
            shape.graphics
                .setStrokeStyle(strokeStyle)
                .beginStroke(strokeColor)
                .moveTo(dimensions.xOffset, dimensions.yOffset)
                .lineTo(x, y);
                
            return draw.setDimensionsOn(shape, dimensions);
        },
        
        rect: function (width, height, color, strokeColor, strokeStyle, xOffset, yOffset, onShape) { 
            var dimensions = buildDimensions(TYPE_RECTANGULAR, width, height, xOffset, yOffset);
            
            var shape = (onShape) ? onShape : new createjs.Shape();
            shape.graphics
                .setStrokeStyle(strokeStyle)
                .beginStroke(strokeColor)
                .beginFill(color)
                .drawRect(dimensions.xOffset, dimensions.yOffset, width, height);
                
            return draw.setDimensionsOn(shape, dimensions, onShape);
        },
        
        roundRect: function (width, height, radius, color, strokeColor, strokeStyle, xOffset, yOffset, onShape) {
            var dimensions = buildDimensions(TYPE_RECTANGULAR, width, height, xOffset, yOffset);
            
            var shape = (onShape) ? onShape : new createjs.Shape();
            shape.graphics
                .setStrokeStyle(strokeStyle)
                .beginStroke(strokeColor)
                .beginFill(color)
                .drawRoundRect(dimensions.xOffset, dimensions.yOffset, width, height, radius);

            draw.setDimensionsOn(shape, dimensions);
            shape.dimensions.cornerRadius = radius;
            return shape;
    	},
    	
    	roundRectComplex: function (width, 
    	                            height, 
    	                            radiusTopLeft, 
    	                            radiusTopRight, 
    	                            radiusBottomRight, 
    	                            radiusBottomLeft, 
    	                            color, 
    	                            strokeColor, 
    	                            strokeStyle, 
    	                            xOffset, 
    	                            yOffset, 
    	                            onShape) {
    	    var dimensions = buildDimensions(TYPE_RECTANGULAR, width, height, xOffset, yOffset);
    	    
        	var shape = (onShape) ? onShape : new createjs.Shape();
        	shape.graphics
        		.setStrokeStyle(strokeStyle)
        		.beginStroke(strokeColor)
        		.beginFill(color)
        		.drawRoundRectComplex(dimensions.xOffset, 
        		                      dimensions.yOffset, 
        		                      width, 
        		                      height, 
        		                      radiusTopLeft, 
        		                      radiusTopRight, 
        		                      radiusBottomRight, 
        		                      radiusBottomLeft);
        		                      
	        draw.setDimensionsOn(shape, dimensions);
	        shape.dimensions.radiusTopLeft = radiusTopLeft;
	        shape.dimensions.radiusTopRight = radiusTopRight;
	        shape.dimensions.radiusBottomRight = radiusBottomRight;
	        shape.dimensions.radiusBottomLeft = radiusBottomLeft;
            return shape;
    	},

    	circle: function (radius, color, strokeColor, strokeStyle, xOffset, yOffset, onShape) { 
        	var dimensions = buildDimensions(TYPE_CIRCULAR, radius * 2, radius * 2, xOffset, yOffset, radius);
        	
        	var shape = (onShape) ? onShape : new createjs.Shape();
        	shape.graphics
        		.setStrokeStyle(strokeStyle)
        		.beginStroke(strokeColor)
        		.beginFill(color)
        		.drawCircle(dimensions.xOffset, dimensions.yOffset, radius);
        	
        	draw.setDimensionsOn(shape, dimensions);
        	shape.radius = radius;
        	return shape;
    	},

        drawEllipse: function (width, height, color, strokeColor, strokeStyle, xOffset, yOffset, onShape) {
            var dimensions = buildDimensions(TYPE_RECTANGULAR, width, height, xOffset, yOffset);
            
            var shape = (onShape) ? onShape : new createjs.Shape();
            shape.graphics
                .setStrokeStyle(strokeStyle)
                .beginStroke(strokeColor)
                .beginFill(color)
                .drawEllipse(dimensions.xOffset, dimensions.yOffset, width, height);
                
            return draw.setDimensionsOn(shape, dimensions);
        },

    	polyStar: function (radius, sides, pointSize, angle, color, strokeColor, strokeStyle, xOffset, yOffset, onShape) {
    		var dimensions = buildDimensions(TYPE_CIRCULAR, radius * 2, radius * 2, xOffset, yOffset, radius);
    		
        	var shape = (onShape) ? onShape : new createjs.Shape();
        	shape.graphics
        		.setStrokeStyle(strokeStyle)
        		.beginStroke(strokeColor)
        		.beginFill(color)
        		.drawPolyStar(dimensions.xOffset, dimensions.yOffset, radius, sides, pointSize || 0, angle);
        	
        	draw.setDimensionsOn(shape, dimensions);
        	shape.radius = radius;
        	return shape;
    	},
    	
        getStartPointX: getStartPointX
    };
    
    
	window.opspark.draw = draw;

}(window));