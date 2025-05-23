import { ref, shallowRef, nextTick } from 'vue';
import { TABS } from '@/constants/app';

type TabName = typeof TABS[number];

export function useTabs() {
  const activeTab = ref<TabName>(TABS[0]); // Default to first tab

  const buttonRefs = {
    Discover: shallowRef<HTMLButtonElement | null>(null),
    Define: shallowRef<HTMLButtonElement | null>(null),
    Develop: shallowRef<HTMLButtonElement | null>(null),
    Deliver: shallowRef<HTMLButtonElement | null>(null),
  };

  const setActiveTab = (tabName: TabName, onLayoutUpdate?: () => void) => {
    activeTab.value = tabName;
    if (onLayoutUpdate) {
      nextTick(() => onLayoutUpdate());
    }
  };

  const handleButtonRefsUpdate = (
    refs: Record<string, HTMLButtonElement | null>,
    onLayoutUpdate?: () => void
  ) => {
    buttonRefs.Discover.value = refs.Discover;
    buttonRefs.Define.value = refs.Define;
    buttonRefs.Develop.value = refs.Develop;
    buttonRefs.Deliver.value = refs.Deliver;
    
    if (onLayoutUpdate) {
      nextTick(() => onLayoutUpdate());
    }
  };

  const areAllButtonRefsAvailable = () => {
    return (
      buttonRefs.Discover.value &&
      buttonRefs.Define.value &&
      buttonRefs.Develop.value &&
      buttonRefs.Deliver.value
    );
  };

  const clearButtonRefs = () => {
    buttonRefs.Discover.value = null;
    buttonRefs.Define.value = null;
    buttonRefs.Develop.value = null;
    buttonRefs.Deliver.value = null;
  };

  return {
    tabs: TABS,
    activeTab,
    buttonRefs,
    setActiveTab,
    handleButtonRefsUpdate,
    areAllButtonRefsAvailable,
    clearButtonRefs,
  };
} 