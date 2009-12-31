(function($) { $.fn.hoverIntent = function(f, g) { var cfg = { sensitivity: 7, interval: 100, timeout: 0 }; cfg = $.extend(cfg, g ? { over: f, out: g} : f); var cX, cY, pX, pY; var track = function(ev) { cX = ev.pageX; cY = ev.pageY; }; var compare = function(ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) { $(ob).unbind("mousemove", track); ob.hoverIntent_s = 1; return cfg.over.apply(ob, [ev]); } else { pX = cX; pY = cY; ob.hoverIntent_t = setTimeout(function() { compare(ev, ob); }, cfg.interval); } }; var delay = function(ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); ob.hoverIntent_s = 0; return cfg.out.apply(ob, [ev]); }; var handleHover = function(e) { var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget; while (p && p != this) { try { p = p.parentNode; } catch (e) { p = this; } } if (p == this) { return false; } var ev = jQuery.extend({}, e); var ob = this; if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); } if (e.type == "mouseover") { pX = ev.pageX; pY = ev.pageY; $(ob).bind("mousemove", track); if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout(function() { compare(ev, ob); }, cfg.interval); } } else { $(ob).unbind("mousemove", track); if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout(function() { delay(ev, ob); }, cfg.timeout); } } }; return this.mouseover(handleHover).mouseout(handleHover); }; })(jQuery);

var orientation = "left"; //future might include opening from right
var linkwidth = [];
var panelwidth = [];
var panelheight = [];
var currentIndex = 0; //count of the element 
var stickycount = 0; // count of the instance


(function($) {
    $.fn.stickytabs = function(options) {

        var defaults = {
            //BASIC 
            width: 300,         // in pixels
            speed: "fast",      // "fast", "slow", or "normal"
            event: "mouseover", // "click" or "mouseover" 

            //EXTRA
            opacity: 1.0,       //between 0.0 and 1.0
            applyPadding: true  //true or false
        };

        var options = $.extend(defaults, options);


        return this.each(function() {


            linkwidth[stickycount] = "0";
            panelheight[stickycount] = "0";
            panelwidth[stickycount] = "0";

            /////////////////////////////////////////////////////////////
            // the handles
            /////////////////////////////////////////////////////////////
            var $root = $(this); //the root div of stickytabs
            var $menu = $root.children(":first")  //the links container
            var $links = $menu.children(); //collection of links
            var $panelcontainer = $root.children(":last") //the panel container
            var $panels = $panelcontainer.children(); //collection of panels

            $menu.children().addClass("stickytabs-link"); //assign handle class to each link
            $panelcontainer.children().addClass("stickytabs-panel"); //assign handle class to each panel

            /////////////////////////////////////////////////////////////
            // assign values
            /////////////////////////////////////////////////////////////
            $root.css("width", options.width + "px"); //the overall width
            $root.css("z-index", "9999"); //the overall width
            $root.css("position", "absolute"); //the overall width
            $menu.css("position", "absolute"); //menu link position

            /////////////////////////////////////////////////////////////
            // calculations
            /////////////////////////////////////////////////////////////
            $links.each(function() {
                $(this).css("cursor", "pointer"); //show hand on mousehover

                //prepend the inside div
                var insideHtml = $(this).html();
                insideHtml = "<div class=\"stickytabs-linkcontent\">" + insideHtml;
                $(this).html(insideHtml);

                //propagate classes from root link to link content div
                var userLinkClasses = $(this).attr("class").replace(" stickytabs-link", ""); // get the classes of the root link div
                $(this).children(":first").attr("class", userLinkClasses); //add the classes to the link content div
                $(this).removeClass(); //clear the root link div
                $(this).addClass("stickytabs-link"); //add the helper class back again
                $(this).children(":first").addClass("stickytabs-linkcontent"); //add the helper class back again

                var contentdiv = $(this).children(":first"); //get the div with the link content

                if (contentdiv.outerWidth() > linkwidth[stickycount]) //update the maxwidth
                    linkwidth[stickycount] = contentdiv.outerWidth();

                var divheight = contentdiv.height() + GetExtraHeight(contentdiv); //the height of the link content

                //create a spacer to hold link's space when it flies out
                contentdiv.after("<div/>");
                contentdiv.next().css("height", divheight + "px"); //spacer - set the height of the spacer
                contentdiv.next().css("width", "0px"); //spacer - set the height of the spacer

                panelheight[stickycount] = (divheight + parseInt(panelheight[stickycount])).toString(); //the overall height of the panels is the sum of the height of the links

                contentdiv.css("position", "absolute"); //we can now make it absolute (can't get its height while absolute)
            });

            panelwidth[stickycount] = (parseInt(options.width) - parseInt(linkwidth[stickycount])).toString(); //we have linkwidth and totalwidth, so lets calculate panelwidth

            /////////////////////////////////////////////////////////////
            // the open event
            /////////////////////////////////////////////////////////////     
            $links.each(function(i, item) {
                //create an attribute that matches each link with a panel
                $(this).children(":first").attr("menuindex", i).attr("stickycount", stickycount);

                //loop all panels
                $panels.each(function(x) {
                    if (x == i)  // index match the link?
                        $(this).attr("menuindex", i).attr("stickycount", stickycount); //assign matching panel the attribute

                    //assign css variables
                    $(this).css("position", "absolute");
                    $(this).css("z-index", "-1");
                    if (options.applyPadding) //pad content from menu
                        $(this).css("padding-left", linkwidth[stickycount] + "px"); //pads the width of the menu

                    //browser width quirk --need to test for safari and opera,
                    if ($.browser.msie) {
                        $(this).css("width", panelwidth[stickycount] + "px");
                        $(this).css("height", panelheight[stickycount] + "px");
                    }
                    else  //mozilla, safari, and 
                    {
                        $(this).css("width", (parseInt(panelwidth[stickycount]) - parseInt(linkwidth[stickycount])).toString() + "px");
                        $(this).css("min-height", panelheight[stickycount] + "px");
                    }

                    $(this).hide(); //default state
                });

                if (options.event == "click")
                    $(this).click(function() {
                        openPanel($(this).children(":first"));
                    });
                else if (options.event == "mouseover")
                    $(this).children(":first").hoverIntent(openPanel, emptyFunction); //mouseover event
            });

            /////////////////////////////////////////////////////////////
            // the close event
            ///////////////////////////////////////////////////////////// 
            $root.mouseleave(function() {
                $panels.hide(); //hide all panels
                $(".stickytabs-linkcontent").css(orientation, "0px"); //move all tabs back
            });

            stickycount++; //instance count

        });

        function openPanel(element) {

            if (element.type == "mouseover")
                element = $(this);

            if (element.css(orientation) == "0px" || element.css(orientation) == "auto") { //its currently closed
                //close all tabs
                $(".stickytabs-link").each(function() {
                    $(this).children(":first").css(orientation, "0px");
                });

                //hide all panels
                $(".stickytabs-panel").hide();

                //find and show corresponding panel
                var menuindex = element.attr("menuindex");
                var instancecount = element.attr("stickycount");
                var $thepanel = $("div[class*='stickytabs-panel'][menuindex='" + menuindex + "'][stickycount='" + instancecount + "']");

                //push the tab over
                var movetabspace = panelwidth[instancecount];
                if ($.browser.mozilla || $.browser.opera || $.browser.safari) {
                    movetabspace = (parseInt(movetabspace) + GetExtraWidth(menuindex, instancecount)).toString();
                }
                element.animate({ left: movetabspace + "px" }, options.speed);

                //push open the panel
                //calculate appropriate width for browser --need to test for safari and opera,
                if ($.browser.msie) {
                    //$thepanel.show(speed);
                    $thepanel.css("width", "0px").animate({
                        width: panelwidth[instancecount] + "px",
                        opacity: options.opacity
                    },
                options.speed);
                }
                else //mozilla, opera, safari
                {
                    //$thepanel.show(speed);
                    var thewidth = parseInt(panelwidth[instancecount]);
                    if (options.applyPadding)
                        thewidth = parseInt(panelwidth[instancecount]) - parseInt(linkwidth[instancecount]);
                    $thepanel.css("width", "0px").animate({
                        width: thewidth + "px",
                        opacity: options.opacity
                    },
                    options.speed);
                }
            }

            else {//close everything
                //close all tabs
                $(".stickytabs-link").each(function() {
                    $(this).children(":first").css(orientation, "0px");
                });

                //hide all panels
                $(".stickytabs-panel").hide();
            }
        }

        //padding sizes for mozilla browsers
        function GetExtraWidth(index, instancecount) {
            //get the panel
            var $thispanel = $("div[class*='stickytabs-panel'][menuindex='" + index + "'][stickycount='" + instancecount + "']"); //.children(":first");

            //add the widths
            var extramovewidth = 0;
            extramovewidth += parseInt($thispanel.css("border-left-width").replace("px", ""));
            extramovewidth += parseInt($thispanel.css("border-right-width").replace("px", ""));

            return extramovewidth;
        }
        
        function GetExtraHeight(contentdiv) {
            //add the heights
            var extralinkheight = 0;
            if (IsNumeric(contentdiv.css("border-top-width").replace("px", "")))
                extralinkheight += parseInt(contentdiv.css("border-top-width").replace("px", ""));
            if (IsNumeric(contentdiv.css("border-bottom-width").replace("px", "")))
                extralinkheight += parseInt(contentdiv.css("border-bottom-width").replace("px", ""));
            return extralinkheight;
        }

        function emptyFunction() { //needed for the hoverIntent method
        }

        function IsNumeric(data) {
            return (data - 0) == data && data.length > 0;
        }
    };

})(jQuery);

