import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const SideNav = ({
  isPopularExpanded,
  togglePopularExpanded,
  isAllSportsExpanded,
  toggleAllSportsExpanded,
  handleSportToQuery,
}) => {
  const [titles, setTitles] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroupExpanded = (group) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [group]: !prevState[group],
    }));
  };
  const getData = async () => {
    try {
      const cache = localStorage.getItem("titles");
      const cacheTimestamp = localStorage.getItem("titlesTimestamp");
      const currentTime = new Date().getTime();
      const fourHours = 4 * 60 * 60 * 1000;

      if (cache && cacheTimestamp && currentTime - cacheTimestamp < fourHours) {
        setTitles(JSON.parse(cache));
        return;
      }

      const response = await fetch(
        "https://odds.p.rapidapi.com/v4/sports?all=true",
        options
      );
      const data = await response.json();
      let groupedTitles = {};

      await data.forEach((sport) => {
        const validKeywords = [
          "MLB",
          "NFL",
          "NBA",
          "NHL",
          "XFL",
          "The Masters",
          "PGA",
          "UFC",
          "NASCAR",
          "WNBA",
          "MLS",
        ];

        const titleMatches = validKeywords.some((keyword) =>
          sport.title.includes(keyword)
        );
        if (titleMatches) {
          if (!groupedTitles[sport.group]) {
            groupedTitles[sport.group] = [];
          }
          groupedTitles[sport.group].push({
            title: sport.title,
            key: sport.key,
          });
        }
      });
      console.log(groupedTitles);
      setTitles(groupedTitles);

      localStorage.setItem("titles", JSON.stringify(groupedTitles));
      localStorage.setItem("titlesTimestamp", currentTime);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getData().catch;
  }, []);

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
      "X-RapidAPI-Host": "odds.p.rapidapi.com",
    },
  };
  return (
    <section className="hidden md:block bg-primary w-64 h-full text-white overflow-y-auto max-h-screen">
      <ul className="text-left text-lg font-semibold">
        <div className="flex items-center mb-2 mt-10">
          <h1 className="ml-4 mr-2 text-xl">Sports Markets</h1>

          {isAllSportsExpanded ? (
            <IoIosArrowUp
              onClick={toggleAllSportsExpanded}
              className="cursor-pointer right-2"
            />
          ) : (
            <IoIosArrowDown
              onClick={toggleAllSportsExpanded}
              className="cursor-pointer"
            />
          )}
        </div>
        {isAllSportsExpanded && (
          <div className="p-2 text-sm text-gray-300">
            {Object.entries(titles).map(([group, subgroups], groupIndex) => {
              if (group === "American Football") {
                group = "Football";
              }

              const filteredSubgroups = subgroups.filter(
                (item) => !item.title.includes("Preseason")
              );

              const updatedSubgroups = filteredSubgroups.map((item) => {
                if (
                  item.title.includes("World Series") ||
                  item.title.includes("Championship") ||
                  item.title.includes("Super")
                ) {
                  const sportName = item.title.split(" ")[0];
                  return { title: `${sportName} Futures`, key: item.key };
                }
                return item;
              });

              return (
                <div key={groupIndex}>
                  <div
                    className="flex items-center px-4 py-6 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleGroupExpanded(group)}
                  >
                    <h2 className="underline">{group}</h2>
                    {expandedGroups[group] ? (
                      <IoIosArrowUp
                        // onClick={() => toggleGroupExpanded(group)}
                        className="cursor-pointer ml-2"
                      />
                    ) : (
                      <IoIosArrowDown
                        // onClick={() => toggleGroupExpanded(group)}
                        className="cursor-pointer ml-2"
                      />
                    )}
                  </div>
                  {expandedGroups[group] && (
                    <ul className="pl-8">
                      {updatedSubgroups.map(({ title, key }, titleIndex) => (
                        <li
                          key={titleIndex}
                          className="whitespace-nowrap overflow-hidden text-ellipsis mb-1 hover:text-white "
                          onClick={() => handleSportToQuery(key)}
                        >
                          <button className="border-none bg-none ">
                            {title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ul>
    </section>
  );
};

export default SideNav;
