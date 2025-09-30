export type tBlock = {
  id: string;
  column_id: string;
  title: string;
  participants: string[];
  content?: tGroupOfPeopleBlockContent;
};

export type tGroupOfPeopleBlockContent = [string, string][];
export type tDecisionMakingBlockContent = {
  [key: string]: { participant: string; name: string }[];
};

export type tChange = {
  action: string;
  pid: string;
  section: string;
  column: string;
  before: string;
  before_value: string;
  after: string;
  before_title: string;
  after_title: string;
};
