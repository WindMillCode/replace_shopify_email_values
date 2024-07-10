// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables, must_be_immutable, unused_local_variable, unused_catch_stack

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WMLTemplatePageWidgetRiverpodProviderValue {
  WMLTemplatePageWidgetRiverpodProviderValue copyWith() {
    return WMLTemplatePageWidgetRiverpodProviderValue();
  }
}

var WMLTemplatePageWidgetRiverpodProviderInstance = WMLTemplatePageWidgetRiverpodProviderValue();

class WMLTemplatePageWidgetRiverpodNotifier
    extends Notifier<WMLTemplatePageWidgetRiverpodProviderValue> {
  @override
  WMLTemplatePageWidgetRiverpodProviderValue build() {
    return WMLTemplatePageWidgetRiverpodProviderInstance;
  }
}

final WMLTemplatePageWidgetRiverpodProvider = NotifierProvider<
    WMLTemplatePageWidgetRiverpodNotifier, WMLTemplatePageWidgetRiverpodProviderValue>(() {
  return WMLTemplatePageWidgetRiverpodNotifier();
});
