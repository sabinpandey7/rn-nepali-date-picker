import {
  FlatList,
  type ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useContext, useMemo } from 'react';
import Day, { type IDay } from './Day';
import { calendarData } from '../../../lib/nepali_date/data/calendar';
import { CalendarContext } from '../context/CalendarContext';
import NepaliDate from '../../../lib/nepali_date/nepali_date';
import { theme } from '../utlis/colors';

const weekDays = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  np: ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'],
};

const DaySelector = ({ activeMonth }: { activeMonth: number }) => {
  const {
    state: { activeYear, today },
    onDateSelect,
    date,
    minDate,
    maxDate,
    dates,
    lang,
    mode,
  } = useContext(CalendarContext);

  const OS = Platform.OS === 'ios' ? 'ios' : 'android';

  const dayGrids = useMemo(() => {
    const numofdays = calendarData[activeYear][0][activeMonth - 1];

    const firstDayofWeek = new NepaliDate(activeYear, activeMonth, 1).getDay();

    const array = [];

    let i = 0;
    for (; i < firstDayofWeek; i++) {
      const item = {
        day: 0,
        isSelected: false,
        isToday: false,
        isDisabled: false,
        isBetween: false,
        isStartDate: false,
        isEndDate: false,
      };
      array.push(item);
    }

    for (i = 1; i <= numofdays; i++) {
      const item = {
        day: i,
        isSelected: false,
        isToday: false,
        isDisabled: false,
        isBetween: false,
        isStartDate: false,
        isEndDate: false,
      };

      const nepali_date_item = new NepaliDate(activeYear, activeMonth, i);
      if (mode === 'range') {
        dates?.forEach((element, index) => {
          if (nepali_date_item.isEqual(element)) {
            if (index === 0) {
              item.isStartDate = true;
            } else {
              item.isEndDate = true;
            }
            item.isSelected = true;
          }
        });
        if (dates && dates.length > 1) {
          if (dates[0] && dates[1]) {
            if (
              nepali_date_item.isSmaller(dates[0]) &&
              nepali_date_item.isGreater(dates[1])
            ) {
              item.isBetween = true;
            }
          }
        }
      } else if (mode === 'multi') {
        dates?.forEach((element) => {
          if (nepali_date_item.isEqual(element)) {
            item.isSelected = true;
          }
        });
      } else {
        if (date && nepali_date_item.isEqual(date)) {
          item.isSelected = true;
        }
      }

      if (nepali_date_item.isEqual(today)) {
        item.isToday = true;
      }

      if (minDate && nepali_date_item.isGreater(minDate)) {
        item.isDisabled = true;
      }
      if (maxDate && nepali_date_item.isSmaller(maxDate)) {
        item.isDisabled = true;
      }

      array.push(item);
    }
    return array;
  }, [activeYear, activeMonth, dates, date, today, maxDate, minDate, mode]);

  const onDayClick = useCallback(
    (day: number) => {
      onDateSelect(new NepaliDate(activeYear, activeMonth, day));
    },
    [onDateSelect, activeYear, activeMonth]
  );

  const renderDay = useCallback(
    ({ item }: ListRenderItemInfo<Omit<IDay, 'lang'>>) => {
      return (
        <Day
          onSelect={onDayClick}
          day={item.day}
          isSelected={item.isSelected}
          isToday={item.isToday}
          isDisabled={item.isDisabled}
          isBetween={item.isBetween}
          isStartDate={item.isStartDate}
          isEndDate={item.isEndDate}
          lang={lang}
        />
      );
    },
    [onDayClick, lang]
  );

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.week}>
          {weekDays[lang].map((l, i) => {
            return (
              <Text
                key={i}
                style={{
                  ...styles.btn,
                  color: OS === 'ios' ? 'darkgrey' : theme[OS].textColor,
                }}
              >
                {l}
              </Text>
            );
          })}
        </View>
      }
      data={dayGrids}
      renderItem={renderDay}
      numColumns={7}
      keyExtractor={(item) => item.day.toString()}
    />
  );
};

export default DaySelector;

const styles = StyleSheet.create({
  calendar: {
    padding: 16,
  },
  week: {
    flexDirection: 'row',
  },
  dates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // flexWrap: "wrap",
  },
  btn: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 24,
    width: '14.28%',
    paddingVertical: 8,
  },
});
