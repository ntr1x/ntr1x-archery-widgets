(function($, Vue, Core, Widgets) {

    Widgets.HeadersGroup = Widgets.Group(Widgets.CompositeCategory, 'default-composite-headers', 'Headers');
    Widgets.FootersGroup = Widgets.Group(Widgets.CompositeCategory, 'default-composite-footers', 'Footers');
    Widgets.NavigationGroup = Widgets.Group(Widgets.CompositeCategory, 'default-composite-navigation', 'Navigation');
    Widgets.GalleryGroup = Widgets.Group(Widgets.CompositeCategory, 'default-composite-gallery', 'Galleries');

})(jQuery, Vue, Core, Widgets);
