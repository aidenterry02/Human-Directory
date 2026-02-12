/**
 * Screen navigation types
 */

export type RootStackParamList = {
  Home: undefined;
  EditPerson: { id: string };
  PersonDetails: { id: string };
  ContactHistory: { id: string };
};

export type RootTabParamList = {
  HomeStack: undefined;
  AddPerson: undefined;
  Settings: undefined;
};
