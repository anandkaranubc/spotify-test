import React from 'react';

const SongList = ({ songs }) => {
    return (
        <div>
            <h3>Song List:</h3>
            <ul>
                {songs.map((song, index) => (
                    <li key={index}>
                        {song.name} - {song.artists.map(artist => artist.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SongList;
